import { Box, Typography } from "@mui/material";
import Image from "next/image";

const Navbar = () => {
  return (
    <Box
      alignItems="center"
      justifyContent="center"
      width={"100%"}
      minHeight={120}
      display={"flex"}
      flexDirection={"row"}
    >
      <Box display={"flex"} alignItems="center">
         <Typography variant="h5">👨‍🏫</Typography>
        <Box width={12} />
        <Typography variant="h5">
          Rajiv
          <Typography
            variant="h5"
            color="primary"
            fontWeight="bold"
            component="span"
          >
            AI
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default Navbar;
