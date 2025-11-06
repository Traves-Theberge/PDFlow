import DocsLayout from '@/components/docs/DocsLayout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'PDFlow Documentation',
  description: 'Complete documentation for PDFlow - AI-powered PDF extraction',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
