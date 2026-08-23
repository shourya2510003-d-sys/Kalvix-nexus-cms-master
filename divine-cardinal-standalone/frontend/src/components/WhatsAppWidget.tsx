'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, onValue } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppWidget() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const whatsappRef = ref(db, 'integrations/whatsapp');
    const unsub = onValue(whatsappRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.val());
      }
    });
    return () => unsub();
  }, []);

  if (!config || !config.enabled) return null;

  const phoneId = config.phoneId;
  if (!phoneId) return null;

  const whatsappUrl = `https://wa.me/${phoneId.replace(/[^0-9]/g, '')}`;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center relative group bg-[#25D366]"
          style={{ width: '40px', height: '40px' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="white"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
