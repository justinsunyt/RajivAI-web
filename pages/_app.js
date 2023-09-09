import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import styles from "../styles/globals.css";
import Navbar from "../components/common/Navbar";
import Script from 'next/script'

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
       <Script src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.min.js' />
       <Script src='https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js'/>
      <CssBaseline />
      <Navbar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;
