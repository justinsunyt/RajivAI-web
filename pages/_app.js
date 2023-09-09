import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import styles from "../styles/globals.css";
import Navbar from "../components/common/Navbar";

const darkTheme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif"
  },
  palette: {
    mode: "dark",
    primary: {
        main: '#1a78ee'
    },
    background: {
        default: '#000',
        paper: '#0a0a0a'
    }
  },
});

const MyApp = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;
