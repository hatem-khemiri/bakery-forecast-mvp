'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

interface Product {
  id: number;
  name: string;
}

interface Sale {
  productId: number;
  quantitySold: number;
  quantityUnsold: number;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [date, setDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [sales, setSales] = useState<Record<number, Sale>>({});
  const [loading, setLoading] = useState(false);
  const [existingSales, setExistingSales] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadSalesForDate();
    }
  }, [date, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadSalesForDate = async () => {
    try {
      const response = await fetch(`/api/sales?date=${date}`);
      const data = await response.json();
      
      // Initialiser les ventes
      const salesData: Record<number, Sale> = {};
      let hasExistingData = false;

      products.forEach((p: Product) => {
        const existingSale = data.sales?.find((s: any) => s.product_id === p.id);
        if (existingSale) {
          salesData[p.id] = {
            productId: p.id,
            quantitySold: existingSale.quantity_sold,
            quantityUnsold: existingSale.quantity_unsold || 0,
          };
          hasExistingData = true;
        } else {
          salesData[p.id] = {
            productId: p.id,
            quantitySold: 0,
            quantityUnsold: 0,
          };
        }
      });

      setSales(salesData);
      setExistingSales(hasExistingData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let saved = 0;
      for (const sale of Object.values(sales)) {
        if (sale.quantitySold > 0 || sale.quantityUnsold > 0) {
          await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'manual',
              data: {
                productId: sale.productId,
                date,
                quantitySold: sale.quantitySold,
                quantityUnsold: sale.quantityUnsold,
              },
            }),
          });
          saved++;
        }
      }
      
      if (saved > 0) {
        alert(existingSales 
          ? `${saved} vente(s) mise(s) à jour !` 
          : `${saved} vente(s) enregistrée(s) !`
        );
        setExistingSales(true);
      } else {
        alert('Aucune vente à enregistrer');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Saisie des ventes</h1>

      <div className="card mb-6">
        <label className="label">Date des ventes</label>
        <input
          type="date"
          className="input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {existingSales && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Des ventes existent déjà pour cette date. Toute modification écrasera les données précédentes.
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Vous devez d'abord ajouter des produits</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité vendue</th>
                <th>Quantité invendue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="input w-24"
                      value={sales[product.id]?.quantitySold || 0}
                      onChange={(e) => setSales({
                        ...sales,
                        [product.id]: {
                          ...sales[product.id],
                          quantitySold: parseInt(e.target.value) || 0,
                        }
                      })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="input w-24"
                      value={sales[product.id]?.quantityUnsold || 0}
                      onChange={(e) => setSales({
                        ...sales,
                        [product.id]: {
                          ...sales[product.id],
                          quantityUnsold: parseInt(e.target.value) || 0,
                        }
                      })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : existingSales ? (
                'Mettre à jour les ventes'
              ) : (
                'Enregistrer les ventes'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}