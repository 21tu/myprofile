import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { WorkProcess } from '@/components/sections/WorkProcess';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
export default function Home() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Services />
        <About />
        <Skills />
        <Projects />
        <WorkProcess />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
