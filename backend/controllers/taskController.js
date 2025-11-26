import Task from '../models/Task.js';
import Group from '../models/Group.js';

export const createTask = async (req, res) => {
  try {
    console.log('📝 Création tâche - body:', req.body);
    
    const { title, description, status, deadline, assignedTo } = req.body;
    const groupId = req.body.group || req.body.groupId;
    
    if (!groupId) {
      console.log('❌ Pas de groupId fourni');
      return res.status(400).json({ success: false, message: 'ID du groupe requis' });
    }
    
    console.log('🔍 Recherche groupe:', groupId);
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.log('❌ Groupe non trouvé:', groupId);
      return res.status(404).json({ success: false, message: 'Groupe non trouvé' });
    }
    
    if (!group.members.includes(req.user._id)) {
      console.log('❌ Utilisateur non membre du groupe');
      return res.status(403).json({ success: false, message: 'Non membre du groupe' });
    }

    console.log('✅ Création de la tâche...');
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      deadline,
      assignedTo,
      group: groupId,
      createdBy: req.user._id,
    });

    group.tasks.push(task._id);
    await group.save();

    console.log('✅ Tâche créée:', task._id);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error('❌ Erreur création tâche:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lister les tâches d’un groupe
export const getTasksByGroup = async (req, res) => {
  try {
    const tasks = await Task.find({ group: req.params.groupId }).populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Tâche non trouvée' });

    const group = await Group.findById(task.group);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Non membre du groupe' });
    }

    const allowed = ['title', 'description', 'status', 'deadline'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Tâche non trouvée' });

    const group = await Group.findById(task.group);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Non membre du groupe' });
    }

    await Task.deleteOne({ _id: task._id });
    group.tasks.pull(task._id);
    await group.save();

    res.status(200).json({ success: true, message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};