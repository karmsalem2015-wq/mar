// src/app/mar-cp/login/layout.tsx
// Login page uses its own minimal layout without sidebar/topbar

import React from 'react';
import '../../../styles/admin.css';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
