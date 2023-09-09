import { useRef, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';


const EndCreditsContainer = styled(Box)(({ theme }) => ({
  height: '200px',
  width: '900px',
  borderRadius: '8px',
  overflow: 'auto',
  backgroundColor: 'grey', // Customize your background color
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center horizontally
  justifyContent: 'center' // Center vertically,
}));

const RollingText = styled(Typography)(({ theme }) => ({
  fontSize: 24, // Customize your text size
  color: 'white', // Customize your text color
  animation: '$scroll 60s linear infinite',
}));


const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth', // for smooth scrolling
      });
  };

const names = [
  'Name 1',
  'Name 2',
  'Name 3',
  'Name 4',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad',
  'Name 5',
  'Name 6',
  'Name 7',
  'Name 8',
  'Name 09',
  'dshjkdfhsdl',
  'daf',
  'dsfssad'
]; // Your list of names goes here

const EndCredits = () => {
  const [visibleNames, setVisibleNames] = useState([]);
  const maxDisplayedNames = 10;
  const nameInterval = 10; // Customize the interval duration in milliseconds

  useEffect(() => {
    const interval = setInterval(() => {
      if (names.length > 0) {
        setVisibleNames((prevNames) => {
          const nextName = names.shift();
        //   if (prevNames.length >= maxDisplayedNames) {
        //     return [...prevNames.slice(1), nextName];
        //   }
            scrollToBottom()
          return [...prevNames, nextName];
        });
      }
    }, nameInterval);

    return () => interval;
  }, []);

  return (
    <EndCreditsContainer>
      {visibleNames.map((name, index) => (
        <RollingText key={index} variant="h5">
          {name}
        </RollingText>
      ))}
    </EndCreditsContainer>
  );
};

export default EndCredits;
