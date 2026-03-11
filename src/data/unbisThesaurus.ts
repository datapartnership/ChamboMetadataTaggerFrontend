// UNBIS Thesaurus - Level 1 and Level 2 themes
// Source: https://metadata.un.org/thesaurus/categories

export interface ThemeLevel2 {
  code: string;
  name: string;
}

export interface ThemeLevel1 {
  code: string;
  name: string;
  subThemes: ThemeLevel2[];
}

export const UNBIS_THESAURUS: ThemeLevel1[] = [
  {
    code: '01',
    name: 'Political and Legal Questions',
    subThemes: [
      { code: '01.01', name: 'Political Conditions, Institutions, Movements' },
      { code: '01.02', name: 'International Relations' },
      { code: '01.03', name: 'Maintenance of Peace and Security' },
      { code: '01.04', name: 'Disarmament and Military Questions' },
      { code: '01.05', name: 'Decolonization, Trusteeship and Apartheid' },
      { code: '01.06', name: 'International Law' },
    ],
  },
  {
    code: '02',
    name: 'Economic Development and Development Finance',
    subThemes: [
      { code: '02.01', name: 'Economic Theory' },
      { code: '02.02', name: 'Economic Conditions' },
      { code: '02.03', name: 'Special Economic Areas' },
      { code: '02.04', name: 'Development' },
      { code: '02.05', name: 'Public Administration' },
      { code: '02.06', name: 'Public Finance' },
      { code: '02.07', name: 'Private Finance' },
      { code: '02.08', name: 'International Monetary Questions' },
      { code: '02.09', name: 'Economic Cooperation' },
    ],
  },
  {
    code: '03',
    name: 'Natural Resources and the Environment',
    subThemes: [
      { code: '03.01', name: 'Geography and Cartography' },
      { code: '03.02', name: 'Resources (General)' },
      { code: '03.03', name: 'Environment' },
      { code: '03.04', name: 'Pollution' },
      { code: '03.05', name: 'Energy Resources' },
      { code: '03.06', name: 'Water Resources' },
      { code: '03.07', name: 'Mineral Resources' },
    ],
  },
  {
    code: '04',
    name: 'Agriculture, Forestry and Fishing',
    subThemes: [
      { code: '04.01', name: 'Agricultural Economics and Policy' },
      { code: '04.02', name: 'Crop Management and Crops' },
      { code: '04.03', name: 'Livestock' },
      { code: '04.04', name: 'Forestry' },
      { code: '04.05', name: 'Fisheries' },
    ],
  },
  {
    code: '05',
    name: 'Industry',
    subThemes: [
      { code: '05.01', name: 'Industrial Development and Property' },
      { code: '05.02', name: 'Management' },
      { code: '05.03', name: 'Manufacturing and Mining Industries' },
      { code: '05.04', name: 'Chemical Industry' },
      { code: '05.05', name: 'Pharmaceutical Industry' },
      { code: '05.06', name: 'Nuclear Industry' },
      { code: '05.07', name: 'Building and Construction Industry' },
      { code: '05.08', name: 'Service Industry' },
    ],
  },
  {
    code: '06',
    name: 'Transport and Communications',
    subThemes: [
      { code: '06.01', name: 'Transport Policy and Operations' },
      { code: '06.02', name: 'Air Transport' },
      { code: '06.03', name: 'Land Transport' },
      { code: '06.04', name: 'Water Transport and Shipping' },
      { code: '06.05', name: 'Postal Services' },
      { code: '06.06', name: 'Telecommunications' },
      { code: '06.07', name: 'Space Technology' },
    ],
  },
  {
    code: '07',
    name: 'International Trade',
    subThemes: [
      { code: '07.01', name: 'General International Trade and Trade Policy' },
      { code: '07.02', name: 'Trade in Commodities' },
      { code: '07.03', name: 'Trade in Manufactures; Barriers to Trade' },
      { code: '07.04', name: 'Trade Promotion and Facilitation' },
    ],
  },
  {
    code: '08',
    name: 'Population',
    subThemes: [
      { code: '08.01', name: 'Population Dynamics' },
      { code: '08.02', name: 'Family Planning' },
      { code: '08.03', name: 'Special and National Groups' },
    ],
  },
  {
    code: '09',
    name: 'Human Settlements',
    subThemes: [
      { code: '09.01', name: 'Settlement Planning' },
      { code: '09.02', name: 'Housing' },
    ],
  },
  {
    code: '10',
    name: 'Health',
    subThemes: [
      { code: '10.01', name: 'Food and Nutrition' },
      { code: '10.02', name: 'Comprehensive Health Services' },
      { code: '10.03', name: 'Disease Prevention and Control' },
      { code: '10.04', name: 'Environmental Health' },
      { code: '10.05', name: 'Safety' },
    ],
  },
  {
    code: '11',
    name: 'Education',
    subThemes: [
      { code: '11.01', name: 'Educational Policy and Planning' },
      { code: '11.02', name: 'Educational Facilities and Technology' },
      { code: '11.03', name: 'Educational Systems' },
      { code: '11.04', name: 'Non-Formal Education' },
      { code: '11.05', name: 'Educational Personnel and Population' },
    ],
  },
  {
    code: '12',
    name: 'Employment',
    subThemes: [
      { code: '12.01', name: 'Employment Promotion and Planning' },
      { code: '12.02', name: 'Skills Development' },
      { code: '12.03', name: 'Conditions of Employment' },
      { code: '12.04', name: 'Labour Relations' },
      { code: '12.05', name: 'Occupations' },
      { code: '12.06', name: 'Special Categories of Workers' },
    ],
  },
  {
    code: '13',
    name: 'Humanitarian Aid and Relief',
    subThemes: [
      { code: '13.01', name: 'Protection of Refugees and Displaced Persons' },
      { code: '13.02', name: 'Disaster Prevention, Preparedness and Relief' },
      { code: '13.03', name: 'Special Humanitarian Operations' },
    ],
  },
  {
    code: '14',
    name: 'Social Conditions and Equity',
    subThemes: [
      { code: '14.01', name: "Women's Advancement" },
      { code: '14.02', name: 'Discrimination and Human Rights' },
      { code: '14.03', name: 'Genealogy and Emblems' },
      { code: '14.04', name: 'Narcotic Drugs and Crime' },
      { code: '14.05', name: 'Social Security' },
    ],
  },
  {
    code: '15',
    name: 'Culture',
    subThemes: [
      { code: '15.01', name: 'Language, Art, Literature and Music' },
      { code: '15.02', name: 'Protection of Intellectual and Cultural Property' },
      { code: '15.03', name: 'Philosophy and Religion' },
      { code: '15.04', name: 'Communication and Mass Media' },
      { code: '15.05', name: 'Information and Documentation' },
    ],
  },
  {
    code: '16',
    name: 'Science and Technology',
    subThemes: [
      { code: '16.01', name: 'Development and Transfer of Technology' },
      { code: '16.02', name: 'Computer Science and Technology' },
      { code: '16.03', name: 'Earth Sciences' },
      { code: '16.04', name: 'Hydrology and Oceanography' },
      { code: '16.05', name: 'Life Sciences' },
      { code: '16.06', name: 'Physical Sciences' },
      { code: '16.07', name: 'Mathematics and Statistics' },
    ],
  },
  {
    code: '17',
    name: 'Geographical Descriptors',
    subThemes: [
      { code: '17.01', name: 'Africa' },
      { code: '17.02', name: 'Americas' },
      { code: '17.03', name: 'Asia and Oceania' },
      { code: '17.04', name: 'Europe' },
      { code: '17.05', name: 'Polar Regions' },
    ],
  },
];

export interface SelectedTheme {
  level1Code: string;
  level1Name: string;
  level2Code?: string;
  level2Name?: string;
}

export const formatThemeDisplay = (theme: SelectedTheme): string => {
  if (theme.level2Name) {
    return `${theme.level1Name} > ${theme.level2Name}`;
  }
  return theme.level1Name;
};

export const parseThemeValue = (value: string): SelectedTheme | null => {
  // Format: "code|level1Name" or "code|level1Name|level2Name"
  const parts = value.split('|');
  if (parts.length < 2) return null;
  
  const code = parts[0];
  const level1Name = parts[1];
  const level2Name = parts[2];
  
  if (code.includes('.')) {
    // It's a level 2 theme
    const level1Code = code.split('.')[0];
    const level1Theme = UNBIS_THESAURUS.find(t => t.code === level1Code);
    return {
      level1Code,
      level1Name: level1Theme?.name || level1Name,
      level2Code: code,
      level2Name: level2Name || level1Name,
    };
  }
  
  return {
    level1Code: code,
    level1Name,
  };
};

export const createThemeValue = (level1: ThemeLevel1, level2?: ThemeLevel2): string => {
  if (level2) {
    return `${level2.code}|${level1.name}|${level2.name}`;
  }
  return `${level1.code}|${level1.name}`;
};
