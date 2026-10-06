/**
 * Member profile fields on the built-in users-permissions "User" (shown in Settings → Users in the
 * admin, and edited by the member in their dashboard).
 */
export default (plugin: any) => {
  const attributes = plugin.contentTypes.user.schema.attributes;

  Object.assign(attributes, {
    fullName: { type: 'string' },
    phone: { type: 'string' },
    dateOfBirth: { type: 'date' },
    gender: { type: 'enumeration', enum: ['female', 'male', 'other', 'prefer-not-to-say'] },
    emergencyContactName: { type: 'string' },
    emergencyContactPhone: { type: 'string' },
    fitnessGoals: { type: 'text' },
    medicalNotes: { type: 'text' },
    marketingOptIn: { type: 'boolean', default: false },
  });

  return plugin;
};
