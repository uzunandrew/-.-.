import React, { useState } from 'react';
import './App.css';

interface Item {
  name: string;
  article: string;
  manufacturer: string;
  link: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>(['ABB', 'Schneider', 'Legrand']);
  const [newManufacturer, setNewManufacturer] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = (window as any).XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = (window as any).XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const parsed: Item[] = rows.map((row) => {
        const name = row[0] ? String(row[0]) : '';
        const manufacturer =
          manufacturers.find((m) => name.toLowerCase().includes(m.toLowerCase())) || '';
        const article = extractArticle(name);
        const query = `${article || name} ${manufacturer}`.trim();
        const link = `https://www.etm.ru/catalog/?q=${encodeURIComponent(query)}`;
        return { name, article, manufacturer, link };
      });
      setItems(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractArticle = (text: string): string => {
    const match = text.match(/[A-Za-z0-9-]+/);
    return match ? match[0] : '';
  };

  const addManufacturer = () => {
    if (newManufacturer.trim()) {
      setManufacturers([...manufacturers, newManufacturer.trim()]);
      setNewManufacturer('');
    }
  };

  const exportExcel = () => {
    const XLSX = (window as any).XLSX;
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    (window as any).saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      'results.xlsx'
    );
  };

  return (
    <div className="App">
      <h1>Поиск материалов</h1>
      <div>
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      </div>
      <div>
        <input
          value={newManufacturer}
          onChange={(e) => setNewManufacturer(e.target.value)}
          placeholder="Добавить производителя"
        />
        <button onClick={addManufacturer}>Добавить</button>
      </div>
      {items.length > 0 && <button onClick={exportExcel}>Экспорт в Excel</button>}
      <table>
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Артикул</th>
            <th>Производитель</th>
            <th>Ссылка</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.article}</td>
              <td>{item.manufacturer}</td>
              <td>
                <a href={item.link} target="_blank" rel="noreferrer">
                  ETM
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

