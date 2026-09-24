import { Library } from 'lucide-react';
import { CATALOG_PATH } from '../../navigation';
import { NavLink } from '../NavLink';

export const CatalogLoginLink = () => (
  <div className="mt-6 pt-6 border-t border-slate-200">
    <NavLink
      to={CATALOG_PATH}
      className="w-full border border-primary-800 text-primary-800 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
    >
      <Library className="w-5 h-5" />
      Browse the Collections Catalog
    </NavLink>
    <p className="mt-2 text-center text-xs text-slate-500">No sign-in required</p>
  </div>
);
