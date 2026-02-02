import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Likes from './pages/Likes';
import PoemDetail from './pages/PoemDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/poem/:id" element={<PoemDetail />} />
          <Route path="/profile" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>Profile Coming Soon</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
