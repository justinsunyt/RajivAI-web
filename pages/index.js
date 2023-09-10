import { Box, Typography } from "@mui/material";
import Head from "next/head";
import BoltIcon from '@mui/icons-material/Bolt';
import InputBox from "../components/InputBox";

const Home = () => {
  return (
    <div>
      <Head>
        <title>RajivAI - Your Personal Test Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box display={'flex'} flexDirection='column' justifyContent='center' alignItems={'center'} paddingTop={'10%'} paddingBottom='10%'>
        <Box width={800} paddingX={'20px'} display='flex' justifyContent={'center'} flexDirection='column'>
          <Box display='flex' flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
            <BoltIcon sx={{ transform: 'scale(2.5)' }} color="primary" />
            <Box sx={{ width: 20 }} />
            <Typography variant="h4">Generate customized exams within seconds</Typography>
          </Box>
          <Box height={25} />
          <InputBox />
        </Box>
      </Box>
    </div>
  );
}

export default Home;
