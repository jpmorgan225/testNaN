import Group from '../models/Group.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'name email');
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('owner', 'name email')
      .populate('tasks');
    if (!group) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    
    // S'assurer que owner est toujours présent (même si populate échoue)
    if (!group.owner) {
      console.log('Owner non peuplé, utilisation de l\'ObjectId brut');
    }
    
    console.log('getGroupById - Groupe:', {
      id: group._id,
      name: group.name,
      owner: group.owner,
      ownerId: group.owner?._id || group.owner,
      membersCount: group.members?.length
    });
    
    res.status(200).json({ success: true, data: group });
  } catch (err) {
    console.error('Erreur getGroupById:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateInviteLink = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    group.inviteToken = token;
    group.inviteExpires = Date.now() + 24 * 60 * 60 * 1000; 
    await group.save();

    const link = `${process.env.FRONTEND_URL}/join/${token}`;
    res.status(200).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    console.log(' Rejoindre groupe - token:', req.params.token);
    console.log(' Utilisateur:', req.user._id);
    
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token, inviteExpires: { $gt: Date.now() } });
    if (!group) {
      console.log('Lien invalide ou expiré');
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
    }

    const userIdStr = req.user._id.toString();
    const isMember = group.members.some(memberId => memberId.toString() === userIdStr);
    
    console.log(' Membres du groupe:', group.members.map(m => m.toString()));
    console.log(' Est déjà membre?', isMember);

    if (isMember) {
      console.log(' Déjà membre du groupe');
      return res.status(400).json({ success: false, message: 'Déjà membre' });
    }

    console.log(' Ajout de l\'utilisateur au groupe...');
    group.members.push(req.user._id);
    await group.save();

    console.log(' Groupe rejoint avec succès');
    res.status(200).json({ success: true, message: 'Rejoint avec succès', data: group });
  } catch (err) {
    console.error(' Erreur joinGroup:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const removeMember = async (req, res) => {
  try {
    console.log(' Retrait membre - Groupe:', req.params.groupId, 'User:', req.params.userId);
    console.log(' Propriétaire actuel:', req.user._id);
    
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.log(' Groupe non trouvé');
      return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    }
    
    console.log(' Propriétaire du groupe:', group.owner.toString());
    console.log(' Membres actuels:', group.members.map(m => m.toString()));
    
    if (group.owner.toString() !== req.user._id.toString()) {
      console.log(' Utilisateur non autorisé (pas propriétaire)');
      return res.status(403).json({ success: false, message: 'Seul le propriétaire du groupe peut retirer des membres' });
    }
    
    const userIdStr = userId.toString();
    const isMember = group.members.some(memberId => memberId.toString() === userIdStr);
    
    if (!isMember) {
      console.log(' Membre non trouvé dans le groupe');
      return res.status(404).json({ success: false, message: 'Ce membre n\'est pas dans ce groupe' });
    }
    
    if (userIdStr === group.owner.toString()) {
      console.log(' Tentative de retirer le propriétaire');
      return res.status(400).json({ success: false, message: 'Le propriétaire du groupe ne peut pas être retiré' });
    }

    console.log(' Retrait du membre...');
    group.members = group.members.filter(id => id.toString() !== userIdStr);
    await group.save();

    console.log(' Membre retiré avec succès');
    res.status(200).json({ success: true, message: 'Membre retiré avec succès' });
  } catch (err) {
    console.error('Erreur removeMember:', err);
    res.status(500).json({ success: false, message: err.message || 'Erreur lors du retrait du membre' });
  }
};