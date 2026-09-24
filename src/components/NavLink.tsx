import { MouseEvent, ReactNode } from 'react';
import { navigate } from '../navigation';

interface NavLinkProps {
  to: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

export const NavLink = ({ to, className, title, children }: NavLinkProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
};
