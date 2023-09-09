import { Box, InputBase, TextField, Typography, IconButton, Modal, Button, Chip } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EastIcon from '@mui/icons-material/East';
import { useEffect, useState } from "react";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Dropzone from 'react-dropzone'
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';

const InputBox = () => {
  const [prompt, setPrompt] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [files, setFiles] = useState([]);

  const onPromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const onSubmitPrompt = () => {
    // Do something with prompt
    console.log(prompt);
  }

  const onSubmitPromptEnter = (event) => {
    if (event.keyCode === 13) {
        // Do something with prompt
        console.log(prompt);
    }
  }

  const [openDocumentModal, setOpenDocumentModal] = useState(false);

  const handleOpenDocumentModal = () => {
    setOpenDocumentModal(true);
  }

  const handleCloseDocumentModal = () => {
    setOpenDocumentModal(false);
  }

  const onFileUpload = async (uploadedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
  }

  useEffect(() => {
    files.forEach(file => {
        const reader = new FileReader();
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
        // Do whatever you want with the file contents
            const binaryStr = reader.result
            const encoder = new TextDecoder('utf-8');

            const text = encoder.decode(binaryStr);
            console.log(text);
        }

        reader.readAsArrayBuffer(file);
    })
  }, [files])

  return (
    <>
    <Box sx={{ backgroundColor: 'hsla(0,0%,15%,0.8)', paddingTop: '12px', paddingX: '3px', paddingBottom: '16px', borderRadius: '8px', border: '1px solid #333'}} width={'100%'}>
      <InputBase onKeyDown={onSubmitPromptEnter} onChange={onPromptChange} sx={{ width: '100%', fontSize: '16px', paddingX: '15px' }} placeholder="Instructions to generate exams..." />
      <Box height={30} />
      <Box width={'100%'} sx={{ paddingX: '7px' }} display='flex' justifyContent={'space-between'}>
        <Box sx={{ '&:hover': { cursor: 'pointer', background: 'black' }, transition: 'background 0.5s ease', paddingX: '5px', paddingY: '5px', borderRadius: '5px' }} display={'flex'} alignItems='center' flexDirection={'row'} onClick={handleOpenDocumentModal}>
            <AddCircleIcon sx={{ width: '18px' }} fontSize="small" color='primary' />
            <Box width={5} />
            <Typography variant="h9" fontSize={'14px'} color='main'>Input Documents</Typography>
        </Box>
        <Box>
        <IconButton onClick={onSubmitPrompt} size="small" sx={{ background: '#1a78ee', marginX: '3px', '&:hover': { background: '#1a78ee' }}}>
            <EastIcon sx={{ color: 'hsla(0,0%,15%,0.8)' }} />
        </IconButton>
        </Box>
      </Box>
    </Box>
    <Modal open={openDocumentModal} onClose={handleCloseDocumentModal}>
        <Box width={700} backgroundColor={'hsla(0,0%,15%,1)'} position='absolute' top={'50%'} left={'50%'} sx={{ transform: 'translate(-50%, -50%)', paddingX: '15px', paddingY: '20px', borderRadius: '5px',  border: '1px solid #333'}}>
            <Box display={'flex'} alignItems='center'>
                <LibraryBooksIcon color="primary" />
                <Box width={20} />
                <Typography variant="h7">Drop files here to help customize LLM for exam generation</Typography>
            </Box>
            <Box sx={{ '&:hover': { cursor: 'pointer' }}}>
            <Dropzone onDrop={onFileUpload}>
            {({getRootProps, getInputProps}) => (
                <section>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {files.length === 0 ? (
                        <Box height={300} display='flex' alignItems='center' justifyContent='center'>
                            <Typography variant="h8" color='grey'>
                            Drag and drop documents here
                            </Typography>
                        </Box>
                    ) : (
                        <>
                        <Box paddingY='30px' display='flex' flexWrap={'wrap'}>
                            {files.map(file => (
                                <Chip sx={{ width: 150, marginBottom: '15px', marginRight: '10px' }} size='small' icon={<LibraryBooksIcon />} key={file.path} label={<Typography variant="h8" noWrap>{file.path}</Typography>} />
                            ))}
                        </Box>
                        <Typography variant="h8" color='grey'>
                            Drag more documents by clicking!
                        </Typography>
                        <Box height={20} />
                        </>
                    )}
                </div>
                </section>
            )}
            </Dropzone>
            </Box>
            <Box display={'flex'} justifyContent='end'>
                <Button onClick={handleCloseDocumentModal} variant="contained" startIcon={<DoNotDisturbOnIcon />}>Cancel</Button>
            </Box>
        </Box>
    </Modal>
    </>
  )
};

export default InputBox;
