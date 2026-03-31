const fs = require('fs');
const path = require('path');

const iconMap = {
  'LayoutGrid': 'faTableCellsLarge',
  'Users': 'faUsers',
  'University': 'faUniversity',
  'ShieldCheck': 'faShieldAlt',
  'DatabaseBackup': 'faDatabase',
  'History': 'faHistory',
  'LogOut': 'faSignOutAlt',
  'Download': 'faDownload',
  'FileSpreadsheet': 'faFileExcel',
  'AlertCircle': 'faExclamationCircle',
  'CheckCircle': 'faCheckCircle',
  'XCircle': 'faTimesCircle',
  'AlertTriangle': 'faExclamationTriangle',
  'Search': 'faSearch',
  'ChevronDown': 'faChevronDown',
  'ChevronUp': 'faChevronUp',
  'X': 'faTimes',
  'Star': 'faStar',
  'Building': 'faBuilding',
  'User': 'faUser',
  'FileText': 'faFileAlt',
  'Mail': 'faEnvelope',
  'Phone': 'faPhone',
  'Clock': 'faClock',
  'Edit': 'faEdit',
  'FileDown': 'faFileDownload',
  'Send': 'faPaperPlane',
  'UserCheck': 'faUserCheck',
  'Monitor': 'faDesktop',
  'CheckSquare': 'faCheckSquare',
  'BarChart2': 'faChartBar',
  'Check': 'faCheck',
  'Printer': 'faPrint',
  'ClipboardList': 'faClipboardList',
  'FileCheck': 'faFileSignature',
  'MessageSquare': 'faComment',
  'Briefcase': 'faBriefcase',
  'Award': 'faAward',
  'Settings': 'faCog',
  'FileArchive': 'faFileArchive',
  'PlusCircle': 'faPlusCircle',
  'Trash2': 'faTrashAlt',
  'MapPin': 'faMapMarkerAlt',
  'ChevronRight': 'faChevronRight',
  'Calendar': 'faCalendarAlt',
  'DollarSign': 'faDollarSign',
  'UploadCloud': 'faCloudUploadAlt',
  'Banknote': 'faMoneyBillWave',
  'Hash': 'faHashtag',
  'GitBranch': 'faCodeBranch',
  'Bell': 'faBell',
  'FileUp': 'faFileUpload',
  'Plus': 'faPlus'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const lucideMatch = content.match(/import\s+{([^}]+)}\s+from\s+['\"]lucide-react['\"]/);
  if (!lucideMatch) return;

  const usedIcons = lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  const faIcons = usedIcons.map(icon => iconMap[icon] || ('fa' + icon));

  // Replace import
  let newImport = `import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';\nimport { ${[...new Set(faIcons)].join(', ')} } from '@fortawesome/free-solid-svg-icons';`;
  content = content.replace(lucideMatch[0], newImport);

  // Replace component usages
  usedIcons.forEach(icon => {
    const faIcon = iconMap[icon] || ('fa' + icon);
    // Replace <IconName ... /> or <IconName>
    const jsxObjRegex = new RegExp(`<${icon}(>|\\s+)`, 'g');
    content = content.replace(jsxObjRegex, `<FontAwesomeIcon icon={${faIcon}}$1`);
    
    // Replace </IconName>
    const jsxCloseRegex = new RegExp(`</${icon}>`, 'g');
    content = content.replace(jsxCloseRegex, `</FontAwesomeIcon>`);

    // Replace <item.icon ... /> (for mapped icons in sidebars)
    // Actually, <item.icon ...> already gets replaced to <FontAwesomeIcon icon={item.icon} ...> below
    // Replace object references e.g. { icon: LayoutGrid } -> { icon: faTableCellsLarge }
    // Only standalone references
    // word boundary with exact match, but avoid matching properties if any
    const refRegex = new RegExp(`(?<=[\\s{,:\\[])(${icon})(?=[\\s},:\\]])`, 'g');
    content = content.replace(refRegex, (match) => {
      // Avoid replacing if it's already part of the modified string or standard JSX replacement missed it
      return faIcon;
    });
  });

  // Now replace <item.icon ... /> -> <FontAwesomeIcon icon={item.icon} ... />
  // Usually it looks like <item.icon className="h-5 w-5 shrink-0" />
  content = content.replace(/<([a-zA-Z0-9_\.]+)\s+([...a-zA-Z0-9_=\"'\{\}\s]+)?\s*\/>/g, (match, tag, attrs) => {
    if (tag === 'item.icon' || tag === 'stat.icon') {
       return `<FontAwesomeIcon icon={${tag}} ${attrs || ''}/>`;
    }
    return match;
  });

  // Specific fix for `<Icon className...` where Icon is dynamic
  content = content.replace(/<([a-zA-Z0-9_]+)\.icon([^>]*)>/g, '<FontAwesomeIcon icon={$1.icon}$2>');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Processed', filePath);
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

traverse(path.join(process.cwd(), 'src'));
