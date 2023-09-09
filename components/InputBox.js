import { Box, InputBase, TextField, Typography, IconButton, Modal, Button, Chip, LinearProgress } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EastIcon from '@mui/icons-material/East';
import { useEffect, useState } from "react";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Dropzone from 'react-dropzone'
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.min.js'
import Tesseract, { createWorker } from 'tesseract.js';
import axios from "axios";
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`);

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const InputBox = () => {
  const [prompt, setPrompt] = useState('');
  const [modelInput, setModelInput] = useState(false);
  const [files, setFiles] = useState([]);
  const [parsedFilesCount, setParsedFilesCount] = useState(files.length);
  const [isFileParsing, setIsFileParsing] = useState(false);
  const wsUrl = 'ws://127.0.0.1:8000/stream';
  const ws = new WebSocket(wsUrl);

  const onPromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const onSubmitPrompt = () => {
    // Do something with prompt
    ws.send(JSON.stringify([{ content: prompt, role: 'user'}]))
    ws.send(JSON.stringify(modelInput));
  }

  const onSubmitPromptEnter = (event) => {
    if (event.keyCode === 13) {
        // Do something with prompt
        ws.send(JSON.stringify([{ content: prompt, role: 'user'}]))
        ws.send(JSON.stringify(modelInput));
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
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.10.111/build/pdf.worker.js";
    files.forEach(file => {
        const reader = new FileReader();
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onloadend = async () => {
            const buffer = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const images = [];
            setIsFileParsing(true);

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({
                    canvasContext: canvas.getContext("2d"),
                    viewport: viewport,
                }).promise;
                images.push(canvas.toDataURL("image/png"));
            }

            for (const image of images) {
                const {
                    data: { text },
                } = await Tesseract.recognize(image, 'eng');
                setModelInput(prevInput => prevInput + text);
            }

            setParsedFilesCount(count => count + 1);
            setIsFileParsing(false);
        }

        reader.readAsArrayBuffer(file);
    })
  }, [files])

  useEffect(() => {
    if (parsedFilesCount <= 0) return;
    if (parsedFilesCount === files.length) {
        console.log(modelInput);
    }
  }, [parsedFilesCount])

  useEffect(() => {
    if (parsedFilesCount <= 0 || modelInput.length === 0) return;
    if (parsedFilesCount === files.length) {
        // ws.onopen = () => {
        //     ws.send(JSON.stringify([{ content: prompt, role: 'user'}]))
        //     ws.send(JSON.stringify(modelInput));
        // }
    }
  }, [prompt, parsedFilesCount])

  return (
    <>
    <Box sx={{ backgroundColor: 'hsla(0,0%,15%,0.8)', paddingTop: '12px', paddingX: '3px', paddingBottom: '16px', borderRadius: '8px', border: '1px solid #333'}} width={'100%'}>
      <InputBase onKeyDown={onSubmitPromptEnter} onChange={onPromptChange} sx={{ width: '100%', fontSize: '16px', paddingX: '15px' }} placeholder="Instructions to generate exams..." />
      <Box height={30} />
      <Box width={'100%'} sx={{ paddingX: '7px' }} display='flex' justifyContent={'space-between'}>
        <Box display={'flex'}>
            <Box sx={{ '&:hover': { cursor: 'pointer', background: 'black' }, transition: 'background 0.5s ease', paddingX: '5px', paddingY: '5px', borderRadius: '5px' }} display={'flex'} alignItems='center' flexDirection={'row'} onClick={handleOpenDocumentModal}>
                <AddCircleIcon sx={{ width: '18px' }} fontSize="small" color='primary' />
                <Box width={5} />
                <Typography variant="h9" fontSize={'14px'} color='main'>Input Documents</Typography>
            </Box>
            <Box width={8} />
            <Box sx={{ '&:hover': { cursor: 'pointer', background: 'black' }, transition: 'background 0.5s ease', paddingX: '5px', paddingY: '5px', borderRadius: '5px' }} display={'flex'} alignItems='center' flexDirection={'row'} onClick={handleOpenDocumentModal}>
                <AccountTreeIcon sx={{ width: '18px' }} fontSize="small" color='primary' />
                <Box width={5} />
                <Typography variant="h9" fontSize={'14px'} color='main'>Specify questions</Typography>
            </Box>
        </Box>
        <Box>
        <IconButton onClick={onSubmitPrompt} size="small" sx={{ background: '#1a78ee', marginX: '3px', '&:hover': { background: '#1a78ee' }}}>
            <EastIcon sx={{ color: 'hsla(0,0%,15%,0.8)' }} />
        </IconButton>
        </Box>
      </Box>
      {isFileParsing && (
       <Box paddingX={'15px'}>
        <Box height={10} />
        <Typography sx={{ fontSize: '12px' }} variant="h9">Parsing documents...</Typography>
        <Box sx={{ width: '100%' }}>
            <LinearProgress />
        </Box>
        </Box>
      )}
      {files.length > 0 && (
        <Box paddingTop={'15px'} paddingX={'14px'}>
            <Box display={'flex'} alignItems='center'>
              <LibraryBooksIcon sx={{ width: 18 }} color="primary" />
              <Box width={8}/>
              <Typography sx={{ fontSize: 12 }}> {files.length} Document{files.length > 1 ? 's' : ''} attached</Typography>
            </Box>
            <Box height={10}/>
            <Box display={'flex'} flexWrap='wrap' justifyContent={'start'}>
                {files.map(file => (
                    <Box width={125} key={file.path}>
                        <Chip sx={{ width: 120, marginBottom: '15px', marginRight: '10px' }} size='small' key={file.path} label={<Typography sx={{ fontSize: '12px' }} variant="h8" noWrap>{file.path}</Typography>} />
                    </Box>
                ))}
            </Box>
        </Box>
      )}
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
                        {isFileParsing && (
                            <>
                               <Box height={10} />
                               <Typography sx={{ fontSize: '12px' }} variant="h9" color='grey'>Parsing files...</Typography>
                               <Box sx={{ width: '100%' }}>
                                 <LinearProgress />
                              </Box>
                            </>
                        )}
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
                <Button onClick={handleCloseDocumentModal} variant="contained" startIcon={<DoNotDisturbOnIcon />}>Close</Button>
            </Box>
        </Box>
    </Modal>
    </>
  )
};

export default InputBox;
