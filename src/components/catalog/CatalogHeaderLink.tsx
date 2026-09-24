import { Library } from 'lucide-react';
import { CATALOG_PATH } from '../../navigation';
import { NavLink } from '../NavLink';

export const CatalogHeaderLink = () => (
  <NavLink
    to={CATALOG_PATH}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
    title="Browse the collections catalog"
  >
    <Library className="w-4 h-4" />
    Catalog
  </NavLink>
);
