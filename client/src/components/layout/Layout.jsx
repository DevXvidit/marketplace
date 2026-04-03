import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import RatesBar from '../common/RatesBar';
import BackToTop from '../common/BackToTop';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <RatesBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
