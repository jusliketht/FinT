export const BusinessType = {
  SoleProprietorship: 'sole_proprietorship',
  Partnership: 'partnership',
  Corporation: 'corporation',
  LLC: 'llc'
};

export const BusinessTypeLabels = {
  [BusinessType.SoleProprietorship]: 'Sole Proprietorship',
  [BusinessType.Partnership]: 'Partnership',
  [BusinessType.Corporation]: 'Corporation',
  [BusinessType.LLC]: 'Limited Liability Company (LLC)'
};

export const BusinessTypeDescriptions = {
  [BusinessType.SoleProprietorship]: 'A business owned and operated by a single individual',
  [BusinessType.Partnership]: 'A business owned by two or more individuals who share profits and losses',
  [BusinessType.Corporation]: 'A legal entity separate from its owners, with limited liability protection',
  [BusinessType.LLC]: 'A hybrid business structure that combines features of a corporation and a partnership'
}; 