import { Box, Typography } from "@mui/material";
import Image from 'next/image'

const Navbar = () => {
  return (
    <Box position={'fixed'} alignItems='center' justifyContent='center' width={'100%'} minHeight={120} display={'flex'} flexDirection={'row'}>
        <Box display={'flex'} alignItems='center'>
            <Image src={'/logo.jpg'} width={40} height={40} alt='Logo' />
            <Box width={15} />
            <Typography variant="h5">Rajiv<Typography variant="h5" color='primary' fontWeight='bold' component='span'>AI</Typography></Typography>
        </Box>
    </Box>
  )
};

export default Navbar;
