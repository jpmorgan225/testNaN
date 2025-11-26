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
      .populate('tasks');
    if (!group) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    res.status(200).json({ success: true, data: group });
  } catch (err) {
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
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token, inviteExpires: { $gt: Date.now() } });
    if (!group) return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Déjà membre' });
    }

    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({ success: true, message: 'Rejoint avec succès', data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json({ success: true, message: 'Membre retiré' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};