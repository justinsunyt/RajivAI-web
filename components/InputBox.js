import { Box, InputBase, TextField, Typography, IconButton, Modal, Button, Chip, LinearProgress, CircularProgress, Card } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EastIcon from '@mui/icons-material/East';
import { useEffect, useRef, useState } from "react";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Dropzone from 'react-dropzone'
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.min.js'
import Tesseract, { createWorker } from 'tesseract.js';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ApprovalIcon from '@mui/icons-material/Approval';
import SettingsIcon from '@mui/icons-material/Settings';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`);

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const InputBox = () => {
  const [prompt, setPrompt] = useState('');
  const [modelInput, setModelInput] = useState(false);
  const [files, setFiles] = useState([]);
  const [parsedFilesCount, setParsedFilesCount] = useState(files.length);
  const [isFileParsing, setIsFileParsing] = useState(false);
  const [promptSettings, setPrompSettings] = useState({ questionsCount: undefined, topics: undefined, questionTypes: undefined, notes: undefined });
  const [promptSettingsList, setPrompSettingsList] = useState(['', '', '', '']);
  const [textBoxValue, setTextBoxValue] = useState('');
  const [wsClosed, setWSClosed] = useState(false);
  const [wsMessaging, setWSMessaging] = useState(false);
  const [wsMessages, setWSMessages] = useState('');
  const wsUrl = 'ws://127.0.0.1:8000/stream';
  const bottomRef = useRef(null);
  const messageBoxRef = useRef(null);

  const isPrompSettingsEmpty = promptSettingsList.filter(setting => setting !== '').length === 0

  const [ws, setWS] = useState();

  useEffect(() => {
    setWS(new WebSocket(wsUrl));
  }, [])

  useEffect(() => {
    if (ws === undefined) return;
    ws.addEventListener("open", (event) => {
        setWSClosed(false);
    });
    ws.addEventListener("close", (event) => {
        setWSClosed(true);
        setWSMessaging(false);
    });
    ws.addEventListener("message", (event) => {
        setWSMessaging(true);
        setWSMessages(prevMessages => prevMessages + String(event.data));
    });
  }, [ws])
  

  const onPromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const onSubmitPrompt = () => {
    if (wsClosed) {
        setWS(new WebSocket(wsUrl));
    }
    ws.send(JSON.stringify([{ content: prompt + (promptSettingsList.filter(setting => setting !== '').length !== 0 ? ' ' + promptSettingsList.join(' ') : ''), role: 'user'}]))
    ws.send(JSON.stringify(modelInput));
  }

  const onSubmitPromptEnter = (event) => {
    if (wsClosed) {
        setWS(new WebSocket(wsUrl));
    }
    if (event.keyCode === 13) {
        ws.send(JSON.stringify([{ content: prompt + (promptSettingsList.filter(setting => setting !== '').length !== 0 ? ' ' + promptSettingsList.join(' ') : ''), role: 'user'}]))
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

  const [openQuestionsModal, setOpenQuestionsModal] = useState(false);

  const handleOpenQuestionsModal = () => {
    setOpenQuestionsModal(true);
  }

  const handleCloseQuestionsModal = () => {
    setOpenQuestionsModal(false);
  }

  const onFileUpload = async (uploadedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
  }

  const [openTextBox, setOpenTextBox] = useState(false);

  const handleOpenTextBox = () => {
    setOpenTextBox(true);
  }

  const handleCloseTextBox = () => {
    setOpenTextBox(false);
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

  const onChangeQuestionsCount = (event) => {
    setPrompSettings(prevObj => {
        const settings = { ...prevObj };
        settings.questionsCount = event.target.value;
        return settings;
    })
  };

  const onChangeQuestionTypes = (event) => {
    setPrompSettings(prevObj => {
        const settings = { ...prevObj };
        settings.questionTypes = event.target.value;
        return settings;
    })
  }

  const onChangeQuestionTopics = (event) => {
    setPrompSettings(prevObj => {
        const settings = { ...prevObj };
        settings.topics = event.target.value;
        return settings;
    })
  }

  const onChangeNotes = (event) => {
    setPrompSettings(prevObj => {
        const settings = { ...prevObj };
        settings.notes = event.target.value;
        return settings;
    })
  }
  const onChangeTextBox = (event) => {
    setTextBoxValue(event.target.value);
  }

  useEffect(() => {
    if (promptSettings.questionsCount !== undefined || promptSettings.questionsCount > 0) {
        // setPromptList(prompt => prompt + ` Make sure to generate ${promptSettings.questionsCount} questions. `)
        setPrompSettingsList(settings => {
            const newSettings = [...settings];
            newSettings[0] = `Make sure to generate ${promptSettings.questionsCount} questions.`;
            return newSettings;
        })
    }
    if (promptSettings.questionTypes !== undefined) {
        setPrompSettingsList(settings => {
            const newSettings = [...settings];
            newSettings[1] = `Make sure to follow this guideline about question types: ${promptSettings.questionTypes}.`;
            return newSettings;
        })
    }
    if (promptSettings.topics !== undefined) {
        setPrompSettingsList(settings => {
            const newSettings = [...settings];
            newSettings[2] = `Make sure to follow this guideline about topics: ${promptSettings.topics}.`;
            return newSettings;
        })
    }
    if (promptSettings.notes !== undefined) {
        setPrompSettingsList(settings => {
            const newSettings = [...settings];
            newSettings[3] = `Make sure to follow this extra notes: ${promptSettings.topics}.`;
            return newSettings;
        })
    }
  }, [promptSettings])

  useEffect(() => {
    if (textBoxValue !== '') {
        setModelInput(prevInput => prevInput + ' ' + textBoxValue)
    }
  }, [textBoxValue])

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
                <Typography variant="h9" fontSize={'14px'} color='main'>Input materials</Typography>
            </Box>
            <Box width={8} />
            <Box sx={{ '&:hover': { cursor: 'pointer', background: 'black' }, transition: 'background 0.5s ease', paddingX: '5px', paddingY: '5px', borderRadius: '5px' }} display={'flex'} alignItems='center' flexDirection={'row'} onClick={handleOpenQuestionsModal}>
                <AccountTreeIcon sx={{ width: '18px' }} fontSize="small" color='primary' />
                <Box width={5} />
                <Typography variant="h9" fontSize={'14px'} color='main'>Specify questions</Typography>
            </Box>
        </Box>
        <Box>
        {wsMessaging ? (
            <Box>
                <CircularProgress size='30px' />
            </Box>
        ) : (
            <IconButton disabled={wsMessaging} onClick={onSubmitPrompt} size="small" sx={{ background: wsMessaging ? 'auto' : '#1a78ee', marginX: '3px', '&:hover': { background: '#1a78ee' }}}>
              <EastIcon sx={{ color: 'hsla(0,0%,15%,0.8)' }} />
           </IconButton>
        )}
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
      {files.length > 0 || textBoxValue !== '' && (
        <Box paddingTop={'15px'} paddingX={'14px'}>
            <Box display={'flex'} alignItems='center'>
              <LibraryBooksIcon sx={{ width: 18 }} color="primary" />
              <Box width={8}/>
              <Typography sx={{ fontSize: 12 }}> {files.length + (textBoxValue !== '')} document{files.length > 1 ? 's' : ''} attached</Typography>
            </Box>
            <Box height={10}/>
            <Box display={'flex'} flexWrap='wrap' justifyContent={'start'}>
                {files.map((file, index) => (
                    <Box width={125} key={file.path}>
                        <Chip sx={{ width: 120, marginBottom: '15px', marginRight: '10px' }} size='small' key={file.path} label={<Typography sx={{ fontSize: '12px' }} variant="h8" noWrap>{(index+1) + '. ' + file.path}</Typography>} />
                    </Box>
                ))}
                {textBoxValue !== '' && (
                    <Box width={125}>
                      <Chip sx={{ width: 120, marginBottom: '15px', marginRight: '10px' }} size='small' label={<Typography sx={{ fontSize: '12px' }} variant="h8" noWrap>Custom text</Typography>} />
                    </Box>
                )}
            </Box>
        </Box>
      )}
      {!isPrompSettingsEmpty && (
        <Box paddingTop={'15px'} paddingX={'12px'}>
            <Box display={'flex'} alignItems='center'>
              <SettingsIcon sx={{ width: 18 }} color="primary" />
              <Box width={8}/>
              <Typography sx={{ fontSize: 14 }}>Settings</Typography>
            </Box>
            <Box height={10} />
            <Box display={'flex'} columnGap={1}>
                {promptSettings.questionsCount !== undefined && (
                    <Box width={'fit-content'} height={'fit-content'} borderRadius={'5px'} paddingX={'8px'} paddingY={'5px'} sx={{ background: 'black' }} >
                        <Typography noWrap sx={{ fontSize: 13 }}>{promptSettings.questionsCount} questions</Typography>
                    </Box>
                )}
                {promptSettings.questionTypes !== undefined && (
                    <Box width={150} height={50} overflow='hidden' borderRadius={'5px'} paddingX={'8px'} paddingY={'5px'} sx={{ background: 'black', overflowY: 'scroll' }} >
                        <Typography textOverflow='ellipsis' whiteSpace='wrap' overflow='hidden' sx={{ fontSize: 13 }}>Type specifications: {promptSettings.questionTypes}</Typography>
                    </Box>
                )}
                 {promptSettings.topics !== undefined && (
                    <Box width={150} height={50} borderRadius={'5px'} paddingX={'8px'} paddingY={'5px'} sx={{ background: 'black', overflowY: 'scroll'  }} >
                        <Typography  textOverflow='ellipsis' whiteSpace='wrap' overflow='hidden' sx={{ fontSize: 13 }}>Topics: {promptSettings.topics}</Typography>
                    </Box>
                )}
                 {promptSettings.notes !== undefined && (
                    <Box width={150} height={50} textOverflow='ellipsis' borderRadius={'5px'} paddingX={'8px'} paddingY={'5px'} sx={{ background: 'black', overflowY: 'scroll'  }} >
                        <Typography textOverflow='ellipsis' whiteSpace='wrap' overflow='hidden' sx={{ fontSize: 13 }}>Notes: {promptSettings.notes}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
      )}
    </Box>
    <Modal open={openDocumentModal} onClose={handleCloseDocumentModal}>
        <Box width={700} backgroundColor={'hsla(0,0%,15%,1)'} position='absolute' top={'50%'} left={'50%'} sx={{ transform: 'translate(-50%, -50%)', paddingX: '15px', paddingY: '20px', borderRadius: '5px',  border: '1px solid #333'}}>
            <Box display={'flex'} alignItems='center'>
                <LibraryBooksIcon color="primary" />
                <Box width={20} />
                <Typography variant="h7">Drop course materials here to help customize LLM for exam generation</Typography>
            </Box>
            <Box sx={{ '&:hover': { cursor: 'pointer' }}}>
            <Dropzone onDrop={onFileUpload}>
            {({getRootProps, getInputProps}) => (
                <section>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {files.length === 0 && textBoxValue === '' ? (
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
                            {textBoxValue !== '' && (
                                <Chip variant="outlined" sx={{ width: 150, marginBottom: '15px', marginRight: '10px' }} size='small' icon={<LibraryBooksIcon />} label={<Typography variant="h8" noWrap>Custom text document</Typography>} />
                            )}
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
            <Button variant="outlined" size="small" onClick={handleOpenTextBox} startIcon={<TextIncreaseIcon />}>Insert text as materials</Button>
            <Box display={'flex'} justifyContent='end'>
                <Button onClick={handleCloseDocumentModal} variant="contained" startIcon={<DoNotDisturbOnIcon />}>Close</Button>
            </Box>
        </Box>
    </Modal>
    <Modal open={openTextBox} onClose={handleCloseTextBox}>
        <Box  width={700} backgroundColor={'hsla(0,0%,15%,1)'} position='absolute' top={'50%'} left={'50%'} sx={{ transform: 'translate(-50%, -50%)', paddingX: '15px', paddingY: '20px', borderRadius: '5px',  border: '1px solid #333'}}>
            <Box display={'flex'} alignItems='center'>
                    <TextIncreaseIcon fontSize="small" color='primary' />
                    <Box width={10} />
                    <Typography variant="h7">Add text as documents into LLM</Typography>
            </Box>
            <Box height={20} />
            <Box>
                <TextField value={textBoxValue} onChange={onChangeTextBox} sx={{ width: '100%' }} variant="outlined" label="Paste text here" multiline rows={10}/>
            </Box>
            <Box height={20} />
            <Box display={'flex'} justifyContent='end'>
                <Button onClick={handleCloseTextBox} variant="contained" startIcon={<AddCircleIcon />}>Submit</Button>
            </Box>
        </Box>
    </Modal>
    <Modal open={openQuestionsModal} onClose={handleCloseQuestionsModal}>
        <Box width={700} backgroundColor={'hsla(0,0%,15%,1)'} position='absolute' top={'50%'} left={'50%'} sx={{ transform: 'translate(-50%, -50%)', paddingX: '15px', paddingY: '20px', borderRadius: '5px',  border: '1px solid #333'}}>
            <Box display={'flex'} alignItems='center'>
                <AccountTreeIcon fontSize="small" color='primary' />
                <Box width={10} />
                <Typography variant="h7">Make specifications for more granular exam generation</Typography>
            </Box>
            <Box height={20} />
            <Box width={'100%'}>
                <TextField onChange={onChangeQuestionsCount} value={promptSettings.questionsCount} sx={{ width: 400 }} variant="outlined" label="How many questions would you like?" type="number" />
                <Box height={15} />
                <TextField onChange={onChangeQuestionTypes} value={promptSettings.questionTypes} sx={{ width: '100%' }} variant="outlined" label="Specify what type of questions you would like? In what order?" multiline rows={3}/>
                <Box height={15} />
                <TextField onChange={onChangeQuestionTopics} value={promptSettings.topics} sx={{ width: '100%' }} variant="outlined" label="What topics you would like to focus on?" multiline rows={3}/>
                <Box height={15} />
                <TextField onChange={onChangeNotes} value={promptSettings.notes} sx={{ width: '100%' }} variant="outlined" label="Extra notes" multiline rows={3}/>
            </Box>
            <Box height={20} />
            <Box display={'flex'} justifyContent='end'>
                <Button onClick={handleCloseQuestionsModal} variant="contained" startIcon={<DoNotDisturbOnIcon />}>Close</Button>
            </Box>
        </Box>
    </Modal>
    <Box height={30} />
    {wsMessaging && (
        <>
           <Box sx={{ backgroundColor: 'hsla(0,0%,15%,0.8)', paddingTop: '12px', paddingX: '3px', paddingBottom: '16px', borderRadius: '8px', border: '1px solid #333'}} width={'100%'}>
            <Box paddingX={'12px'} paddingY={'10xp'}>
              <Typography variant="h6">Generating exam</Typography>
            </Box>
            <Box height={15} />
            <Box paddingX={'12px'} sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
           </Box>
           <Box height={30} />
        </>
    )}
    {wsMessages !== '' && (
      <Box sx={{ backgroundColor: 'hsla(0,0%,15%,0.8)', paddingTop: '12px', paddingX: '3px', paddingBottom: '16px', borderRadius: '8px', border: '1px solid #333'}} width={'100%'}>
         <Box paddingX={'12px'} paddingY={'10xp'}>
            <Box display={'flex'} alignItems='center'>
              <AutoGraphIcon sx={{ width: 32, height: 32 }} color='primary'/>
              <Box width={10} />
              <Typography variant="h6">Model Output</Typography>
            </Box>
           <Box>
           <Box height={20} />
            <Box whiteSpace={'pre-wrap'} sx={{ width: '100%', fontSize: '12px', background: 'black', overflowY: 'scroll', height: 250, paddingX: '18px', paddingY: '15px', borderRadius: '10px' }} display={'flex'} flexDirection='column-reverse'>
                {wsMessages}
                <span ref={bottomRef}></span>
            </Box>
           </Box>
         </Box>
     </Box>
    )}
    </>
  )
};

export default InputBox;
