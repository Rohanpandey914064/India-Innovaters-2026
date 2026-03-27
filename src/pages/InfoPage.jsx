import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const InfoPage = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-antigravity cursor-default">
          <span className="text-3xl">ðŸš§</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          We're currently building out this section of CitySpark. In the meantime, you can explore the dashboard or check out the interactive map.
        </p>
        <Link to="/">
          <Button size="lg" className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default InfoPage;

