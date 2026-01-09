/**
 * App Component - 앱 진입점
 *
 * React Router를 사용하여 SPA 라우팅 구현
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
