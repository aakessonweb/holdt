/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState as brugStat, useEffect } from 'react';
import { 
  Home, 
  Heart, 
  Play, 
  User, 
  ChevronLeft, 
  X, 
  Pause, 
  Play as PlayIcon, 
  Clock, 
  BookOpen,
  ChevronRight,
  MessageSquare,
  Wind,
  Accessibility
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { CONTENT, FEELINGS } from './data';
import { Category, ContentItem, Feeling } from './types';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Components ---

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'home', label: 'Hjem', icon: Home },
    { id: 'favorites', label: 'Favoritter', icon: Heart },
    { id: 'exercises', label: 'Øvelser', icon: Play },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-holdt-nav border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === tab.id ? 'text-white' : 'text-white/60'
          }`}
        >
          <tab.icon size={24} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Header = ({ onBack, onAI, profilbillede, showProfile = true }: { onBack?: () => void, onAI?: () => void, profilbillede: string, showProfile?: boolean }) => (
  <header className="relative flex flex-col items-center px-6 pt-8 pb-4 z-10">
    <div className="w-full flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="text-holdt-text">
          <ChevronLeft size={28} />
        </button>
      ) : (
        <div className="w-7" />
      )}
      
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-holdt-accent">
            <Heart size={20} fill="currentColor" />
          </div>
        </div>
        <h1 className="text-3xl font-serif tracking-widest uppercase text-holdt-text">Holdt</h1>
      </div>

      {onAI ? (
        <button onClick={onAI} className="text-holdt-accent glass rounded-full p-1">
          <Accessibility size={24} />
        </button>
      ) : (
        <div className="w-7" />
      )}
    </div>

    {showProfile && (
      <div className="mt-4 w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-sm">
        <img 
          src={profilbillede} 
          alt="Profile" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    )}
  </header>
);

const CategoryCard = ({ title, subtitle, icon: Icon, onClick }: { title: string, subtitle: string, icon: any, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="glass rounded-3xl p-5 flex flex-col items-center text-center gap-3 w-full transition-transform active:scale-95"
  >
    <div className="text-holdt-accent opacity-60">
      <Icon size={40} />
    </div>
    <div>
      <h3 className="text-lg font-serif text-holdt-text mb-1">{title}</h3>
      <p className="text-[10px] leading-relaxed text-gray-500 px-2">{subtitle}</p>
    </div>
  </button>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = brugStat('home');
  const [view, setView] = brugStat<'main' | 'feelings' | 'category' | 'player' | 'talks' | 'ai-image'>('main');
  const [selectedCategory, setSelectedCategory] = brugStat<Category | null>(null);
  const [selectedItem, setSelectedItem] = brugStat<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = brugStat(false);
  const [profilbillede, sætProfilbillede] = brugStat("/trine2.jpg");
  const [aiPrompt, setAiPrompt] = brugStat("");
  const [isGenerating, setIsGenerating] = brugStat(false);

  // Background image
  const bgImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920&h=1080";

  const handleGenerateImage = async () => {
    if (!aiPrompt) return;
    
    // Check for API key selection as per guidelines
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Proceed after selection
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: aiPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          sætProfilbillede(imageUrl);
          setView('main');
          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat === 'talks') setView('talks');
    else setView('category');
  };

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
    setView('player');
    setIsPlaying(true);
  };

  const renderView = () => {
    switch (view) {
      case 'main':
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="px-6 pb-32 flex flex-col gap-6"
          >
            <div className="text-center mb-4">
              <p className="text-sm italic text-gray-600">Når livet og relationer bliver svære – bliver du holdt.</p>
            </div>

            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800" 
                alt="Reflection" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="glass rounded-2xl p-4 flex items-center justify-between w-[90%]">
                  <div className="flex items-center gap-3">
                    <Wind className="text-holdt-accent" size={20} />
                    <span className="text-lg font-serif">Dagens refleksion</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-holdt-accent/80 flex items-center justify-center text-white">
                    <PlayIcon size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CategoryCard 
                title="Relationer" 
                subtitle="Parforhold, selvværd & narcissisme." 
                icon={MessageSquare}
                onClick={() => handleCategoryClick('relations')}
              />
              <CategoryCard 
                title="Meditation" 
                subtitle="Guidede meditationer til ro, accept og indre balance." 
                icon={Wind}
                onClick={() => handleCategoryClick('meditation')}
              />
              <CategoryCard 
                title="Ro i kroppen" 
                subtitle="Blid terapeutisk yoga der beroliger nervesystemet." 
                icon={Accessibility}
                onClick={() => handleCategoryClick('yoga')}
              />
            </div>

            <button 
              onClick={() => setView('feelings')}
              className="glass rounded-full py-4 px-8 flex items-center justify-center gap-3 w-full shadow-sm active:scale-95 transition-transform"
            >
              <Heart className="text-red-300" fill="currentColor" size={20} />
              <span className="text-lg font-serif">Jeg har det svært lige nu</span>
            </button>
          </motion.div>
        );

      case 'feelings':
        return (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="px-6 pb-32 flex flex-col gap-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl mb-2">Jeg har det svært lige nu</h2>
              <p className="text-sm text-gray-600">Hvad fylder hos dig lige nu?</p>
            </div>
            
            {FEELINGS.map((feeling) => (
              <button
                key={feeling.id}
                onClick={() => {
                  const item = CONTENT.find(c => c.id === feeling.contentId);
                  if (item) handleItemClick(item);
                }}
                className="glass rounded-2xl p-5 flex items-center gap-4 w-full text-left active:scale-95 transition-transform"
              >
                <span className="text-2xl">{feeling.icon}</span>
                <span className="text-lg font-serif flex-1">{feeling.label}</span>
              </button>
            ))}
          </motion.div>
        );

      case 'category':
        const items = CONTENT.filter(c => c.category === selectedCategory);
        const catTitle = selectedCategory === 'meditation' ? 'Meditation' : 
                         selectedCategory === 'yoga' ? 'Ro i kroppen' : 'Relationer';
        const catSub = selectedCategory === 'meditation' ? 'Find ro og nærvær.' : 
                       selectedCategory === 'yoga' ? 'Blide terapeutiske yogaøvelser.' : 'Forstå dig selv og dine relationer.';

        return (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="px-6 pb-32 flex flex-col gap-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-3xl mb-2">{catTitle}</h2>
              <p className="text-sm text-gray-600">{catSub}</p>
            </div>

            <div className="flex gap-2 justify-center mb-4">
              {['5-10 min', '10-20 min', 'Alle'].map((filter) => (
                <button key={filter} className={`px-4 py-1 rounded-full text-xs glass ${filter === 'Alle' ? 'bg-holdt-accent/20' : ''}`}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="glass rounded-3xl overflow-hidden divide-y divide-white/20">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full p-4 flex items-center gap-4 text-left active:bg-white/20 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg leading-tight mb-1">{item.title}</h4>
                    {item.duration && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock size={10} />
                        <span>{item.duration}</span>
                      </div>
                    )}
                    {item.description && <p className="text-[10px] text-gray-500">{item.description}</p>}
                  </div>
                  <Heart size={18} className="text-holdt-accent/40" />
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'talks':
        const talks = CONTENT.filter(c => c.category === 'talks');
        return (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="px-6 pb-32 flex flex-col gap-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-3xl mb-2">Forstå relationer</h2>
              <p className="text-sm text-gray-600">Mini-foredrag der giver dig indsigt og klarhed</p>
            </div>

            <div className="flex flex-col gap-3">
              {talks.map((talk) => (
                <button
                  key={talk.id}
                  onClick={() => handleItemClick(talk)}
                  className="glass rounded-2xl p-4 flex items-center gap-4 text-left active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-holdt-accent/20 flex items-center justify-center text-holdt-accent">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-base leading-tight">{talk.title}</h4>
                    <p className="text-[10px] text-gray-500">{talk.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center text-gray-500">
                    <PlayIcon size={14} fill="currentColor" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'player':
        if (!selectedItem) return null;
        return (
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[60] flex flex-col"
          >
            <div className="absolute inset-0 -z-10">
              <img src={bgImage} className="w-full h-full object-cover blur-sm" alt="bg" />
              <div className="absolute inset-0 bg-white/30" />
            </div>

            <header className="flex items-center justify-between px-6 py-8">
              <div className="w-10" />
              <div className="flex flex-col items-center">
                <div className="text-holdt-accent mb-1">
                  <Heart size={20} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-serif tracking-widest uppercase text-holdt-text">Holdt</h1>
              </div>
              <button onClick={() => setView('main')} className="text-holdt-text glass rounded-full p-2">
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
              <h2 className="text-3xl font-serif">{selectedItem.title}</h2>
              <p className="text-sm text-gray-600 italic">Hvad fylder hos dig lige nu?</p>

              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                  <img 
                    src={profilbillede} 
                    alt="Speaker" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Visualizer mock */}
                <div className="absolute -left-12 -right-12 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-40 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: isPlaying ? [10, 40, 20, 50, 15] : 10 }}
                      transition={{ repeat: Infinity, duration: 1 + Math.random(), ease: "easeInOut" }}
                      className="w-1 bg-holdt-accent rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isPlaying ? '60%' : '60%' }}
                    className="h-full bg-holdt-accent"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                  <span>2:13</span>
                  <span>-1:12</span>
                </div>
              </div>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-holdt-accent/80 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
              >
                {isPlaying ? <Pause size={40} fill="currentColor" /> : <PlayIcon size={40} fill="currentColor" className="ml-2" />}
              </button>

              <p className="text-sm italic text-gray-600 mt-4">Du er ikke forkert – du bliver holdt.</p>
            </div>

            <div className="glass-dark p-6 flex justify-around items-center">
              <button className="flex flex-col items-center gap-1 text-gray-500">
                <Clock size={20} />
                <span className="text-[10px] uppercase">Små pauser</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-holdt-accent">
                <Heart size={20} fill="currentColor" />
                <span className="text-[10px] uppercase">Favorit</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-500">
                <BookOpen size={20} />
                <span className="text-[10px] uppercase">Lyt mere</span>
              </button>
            </div>
          </motion.div>
        );

      case 'ai-image':
        return (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="px-6 pb-32 flex flex-col gap-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-3xl mb-2">AI Profilbillede</h2>
              <p className="text-sm text-gray-600">Beskriv hvordan dit profilbillede skal se ud</p>
            </div>

            <div className="glass rounded-3xl p-6 flex flex-col gap-4">
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="F.eks. En venlig kvinde med lyst hår og et varmt smil..."
                className="w-full h-32 bg-white/20 rounded-2xl p-4 text-holdt-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-holdt-accent"
              />
              
              <button 
                onClick={handleGenerateImage}
                disabled={isGenerating || !aiPrompt}
                className="w-full py-4 bg-holdt-accent text-white rounded-full font-serif text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                {isGenerating ? 'Genererer...' : 'Generer billede'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-gray-500 italic">Dette bruger Gemini 3.1 Flash Image Preview til at skabe dit billede.</p>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-holdt-accent underline">Læs om billing her</a>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') setView('main');
    else setView('main'); // Placeholder for other tabs
  };

  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto holdt-bg overflow-hidden shadow-2xl">
      {/* Background Layer - Removed Unsplash Image */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
      </div>

      <Header 
        onBack={view !== 'main' ? () => setView('main') : undefined} 
        onAI={view === 'main' ? () => setView('ai-image') : undefined}
        profilbillede={profilbillede}
        showProfile={view !== 'player'}
      />

      <main className="h-[calc(100vh-180px)] overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      {view !== 'player' && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
