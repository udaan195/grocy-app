// pages/DashboardPage.jsx
import React from 'react';
// ... other imports
import ShoppingList from '../components/ShoppingList'; // Import the new component

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // User ka data store karne ke liye
  const [loading, setLoading] = useState(true); // Loading state ke liye

  useEffect(() => {
    // Ye function user ka data fetch karega
    const fetchUserData = async () => {
      try {
        // 1. localStorage se token nikalo
        const token = localStorage.getItem('authToken');

        if (!token) {
          // Agar token nahi hai, to login page par bhej do
          navigate('/login');
          return;
        }

        // 2. API call karo, aur header mein token bhejo
        const response = await axios.get('https://grocy-app-server.onrender.com/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // 3. Response se mile data ko 'user' state mein set karo
        setUser(response.data);

      } catch (error) {
        console.error("User data fetch nahi kar paaye:", error);
        // Agar token invalid hai ya koi aur error hai, to user ko logout kar do
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false); // Data fetch ho gaya ya error aayi, loading band karo
      }
    };

    fetchUserData();
  }, [navigate]); // Dependency array mein navigate daalein

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Jab tak data load ho raha hai, loading message dikhao
  if (loading) {
    return <div>Loading...</div>;
  }
  // ... existing code for user data and logout

  return (
    <div>
      <h1>Welcome, {user ? user.name : 'Guest'}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      {/* Add the shopping list component here */}
      <ShoppingList />
    </div>
  );
};

export default DashboardPage;
