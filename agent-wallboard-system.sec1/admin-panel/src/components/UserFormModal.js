// components/UserFormModal.js
import React, { useState, useEffect } from 'react';
import '../styles/UserFormModal.css';

const UserFormModal = ({ user, onClose, onSave }) => {
  // Initialize form data
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'Agent',
    teamId: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  // Load user data if editing
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        teamId: user.teamId ?? '',
        status: user.status
      });
    }
  }, [user]);

  /**
   * ✅ handleChange: อัปเดตค่าและเคลียร์ error เฉพาะฟิลด์นั้น
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * ✅ validateForm: เช็กรูปแบบ username / ชื่อ / team ตาม role
   */
  const validateForm = () => {
    const newErrors = {};

    // username
    const username = (formData.username || '').trim();
    const usernameRegex = /^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(username)) {
      newErrors.username = 'Invalid username format';
    }

    // fullName
    const fullName = (formData.fullName || '').trim();
    if (!fullName || fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // role-specific: Agent/Supervisor ต้องมี team
    if ((formData.role === 'Agent' || formData.role === 'Supervisor') && !formData.teamId) {
      newErrors.teamId = 'Team is required for Agent and Supervisor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * ✅ handleSubmit: ตรวจแล้วค่อยส่ง onSave
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // แปลง teamId เป็น number หรือ null ก่อนส่งไป backend
    const payload = {
      ...formData,
      teamId:
        formData.teamId === '' || formData.role === 'Admin'
          ? null
          : Number(formData.teamId)
    };

    onSave(payload);
  };

  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', {
      className: 'modal-content',
      onClick: (e) => e.stopPropagation()
    },
      // Modal Header
      React.createElement('div', { className: 'modal-header' },
        React.createElement('h2', null, user ? 'Edit User' : 'Add New User'),
        React.createElement('button', {
          className: 'btn-close',
          onClick: onClose
        }, '×')
      ),

      // Modal Body (Form)
      React.createElement('form', { onSubmit: handleSubmit, className: 'user-form' },
        // Username field
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'username' },
            'Username ',
            React.createElement('span', { className: 'required' }, '*')
          ),
          React.createElement('input', {
            type: 'text',
            id: 'username',
            name: 'username',
            value: formData.username,
            onChange: handleChange,
            placeholder: 'e.g., AG001, SP001, AD001',
            disabled: !!user, // disabled เมื่อแก้ไข
            className: errors.username ? 'error' : ''
          }),
          React.createElement('small', { className: 'hint' },
            'Format: AG001-AG999 (Agent), SP001-SP999 (Supervisor), AD001-AD999 (Admin)'
          ),
          errors.username && React.createElement('span', { className: 'error-message' },
            errors.username
          )
        ),

        // Full Name field
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'fullName' },
            'Full Name ',
            React.createElement('span', { className: 'required' }, '*')
          ),
          React.createElement('input', {
            type: 'text',
            id: 'fullName',
            name: 'fullName',
            value: formData.fullName,
            onChange: handleChange,
            placeholder: 'Enter full name',
            className: errors.fullName ? 'error' : ''
          }),
          errors.fullName && React.createElement('span', { className: 'error-message' },
            errors.fullName
          )
        ),

        // Role field
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'role' },
            'Role ',
            React.createElement('span', { className: 'required' }, '*')
          ),
          React.createElement('select', {
            id: 'role',
            name: 'role',
            value: formData.role,
            onChange: handleChange,
            className: errors.role ? 'error' : ''
          },
            React.createElement('option', { value: 'Agent' }, 'Agent'),
            React.createElement('option', { value: 'Supervisor' }, 'Supervisor'),
            React.createElement('option', { value: 'Admin' }, 'Admin')
          )
        ),

        // Team field
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'teamId' }, 'Team'),
          React.createElement('select', {
            id: 'teamId',
            name: 'teamId',
            value: formData.teamId,
            onChange: handleChange,
            className: errors.teamId ? 'error' : ''
          },
            React.createElement('option', { value: '' }, '-- Select Team --'),
            React.createElement('option', { value: '1' }, 'Team Alpha'),
            React.createElement('option', { value: '2' }, 'Team Beta'),
            React.createElement('option', { value: '3' }, 'Team Gamma')
          ),
          React.createElement('small', { className: 'hint' },
            'Required for Agent and Supervisor roles'
          ),
          errors.teamId && React.createElement('span', { className: 'error-message' },
            errors.teamId
          )
        ),

        // Status field
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'status' },
            'Status ',
            React.createElement('span', { className: 'required' }, '*')
          ),
          React.createElement('select', {
            id: 'status',
            name: 'status',
            value: formData.status,
            onChange: handleChange
          },
            React.createElement('option', { value: 'Active' }, 'Active'),
            React.createElement('option', { value: 'Inactive' }, 'Inactive')
          )
        ),

        // Form Actions
        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', {
            type: 'button',
            className: 'btn btn-secondary',
            onClick: onClose
          }, 'Cancel'),
          React.createElement('button', {
            type: 'submit',
            className: 'btn btn-primary'
          }, user ? 'Update User' : 'Create User')
        )
      )
    )
  );
};

export default UserFormModal;
