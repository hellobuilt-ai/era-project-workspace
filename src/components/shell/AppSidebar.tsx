import { SideNav } from "./SideNav";

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="app-sidebar" aria-label="Practice">
      <SideNav pathname={pathname} />
    </aside>
  );
}
