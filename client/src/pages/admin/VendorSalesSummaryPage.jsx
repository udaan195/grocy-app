import React, { useEffect, useState } from 'react';
import axios from '../../api.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './DashboardCharts.css'; // ✅ Custom styling for better look

Chart.register(...registerables);

const VendorSalesSummaryPage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/admin/vendor-sales-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummaryData(data);
      setError('');
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('डेटा लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <p className="loading-text">📊 Vendor Sales Summary लोड हो रहा है...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (summaryData.length === 0) return <p className="no-data-text">कोई बिक्री डेटा उपलब्ध नहीं है।</p>;

  const barChartData = {
    labels: summaryData.map((item) => item.vendorName),
    datasets: [
      {
        label: 'Total Sales (₹)',
        data: summaryData.map((item) => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const pieChartData = {
    labels: summaryData.map((item) => item.vendorName),
    datasets: [
      {
        label: 'Sales Distribution',
        data: summaryData.map((item) => item.totalSales),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="summary-container">
      <h2 className="summary-heading">📈 Vendor Wise Sales Summary</h2>

      <div className="chart-container">
        <h4 className="chart-title">Bar Chart</h4>
        <Bar data={barChartData} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h4 className="chart-title">Pie Chart</h4>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default VendorSalesSummaryPage;