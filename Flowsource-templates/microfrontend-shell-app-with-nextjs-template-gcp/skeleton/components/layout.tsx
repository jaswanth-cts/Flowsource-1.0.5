import Navbar from './Navbar'
import Footer from './Footer'
 
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar organizationName="Cognizant Demo"/>
      <main>{children}</main>
      <Footer />
    </>
  )
}