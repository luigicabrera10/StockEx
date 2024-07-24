import { Route, Routes, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import routes from '../routes';


import { Outlet } from 'react-router-dom';
import Home from '../layouts/home';
import Dashboard from '../layouts/dashboard';


const LayoutWrapper = ({ layout: Layout, children }: { layout: React.ComponentType<any>, children: React.ReactNode }) => (
  <Layout>
    {children}
  </Layout>
);

function Routing() {

  const location = useLocation();

  let uniqueLayouts: { layout: string, component: JSX.Element }[] = [];

  routes.forEach(({ layout, component: Component }) => {
    if (!uniqueLayouts.some(l => l.layout === layout)) {
      uniqueLayouts.push({ layout, component: <Component /> });
    }
  });

  // console.log("uniqueLayouts: ", uniqueLayouts);

  return (
    <Routes location={location} key={location.pathname}>

      {/* Redirect Routes */}
      <Route
        path="/dashboard"
        element={<Navigate to="/dashboard/default/" />}
      />
      <Route
        path="/home"
        element={<Navigate to="/home/sign-in/" />}
      />
      <Route
        path="/"
        element={<Navigate to="/dashboard/default" />}
      />

      {uniqueLayouts.map(({ layout, component }) => (
        <Route
          key={layout + "/*"}
          path={`${layout}/*`}
          element={
            <LayoutWrapper layout={getLayout(layout)}>
              {component}
            </LayoutWrapper>
          }
        />
      ))}

      {/* <Route
        path="/dashboard/*"
        element={< Dashboard />}
      />
      <Route
        path="/home/*"
        element={< Home />}
      /> */}

    </Routes>
  );
}

// Helper function to get the layout component
const getLayout = (layout: string) => {
  switch(layout) {
    case '/dashboard':
      return Dashboard;
    case '/home':
      return Home;
    default:
      return Home; // default layout if none matches
  }
};

export { Routing };
