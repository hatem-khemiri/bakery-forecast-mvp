'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  category: string | null;
  business_importance: 'coeur' | 'secondaire' | 'opportuniste';
  active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    businessImportance: 'coeur' as 'coeur' | 'secondaire' | 'opportuniste',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', category: '', businessImportance: 'coeur' });
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Annuler' : '+ Ajouter un produit'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-medium mb-4">Nouveau produit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nom du produit *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Baguette tradition"
              />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Pains, Viennoiseries..."
              />
            </div>
            <div>
              <label className="label">Importance business *</label>
              <select
                className="input"
                value={formData.businessImportance}
                onChange={(e) => setFormData({ ...formData, businessImportance: e.target.value as any })}
              >
                <option value="coeur">Cœur de métier</option>
                <option value="secondaire">Secondaire</option>
                <option value="opportuniste">Opportuniste</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Ajouter
            </button>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun produit configuré</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Ajouter votre premier produit
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Importance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded ${
                      product.business_importance === 'coeur' 
                        ? 'bg-green-100 text-green-800'
                        : product.business_importance === 'secondaire'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.business_importance}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}