'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Recommendation {
  productName: string;
  quantityStandard: number;
  quantityPrudent: number;
  confidenceLevel: number;
  weatherCondition: string;
  explanation: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setRecommendations(data.recommendations);
        setGenerated(true);
      } else {
        alert(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = format(addDays(new Date(), 1), 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommandations</h1>
      <p className="text-gray-600 mb-8">Pour {tomorrow}</p>

      {!generated ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-6">
            Générez vos recommandations de production pour demain
          </p>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <span className="spinner"></span> : 'Générer les recommandations'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="card">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{rec.productName}</h3>
                <span className="text-sm text-gray-500">
                  Confiance : {rec.confidenceLevel}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Standard</p>
                  <p className="text-3xl font-bold text-green-700">
                    {rec.quantityStandard}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Prudente</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {rec.quantityPrudent}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Météo :</strong> {rec.weatherCondition}</p>
                <p className="mt-2">{rec.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}