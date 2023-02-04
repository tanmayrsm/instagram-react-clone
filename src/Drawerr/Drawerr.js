import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Home from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";
import * as React from "react";
import './Drawerr.css';
import SearchUser from "../SearchUser/SearchUser";
import CreatePost from "../CreatePost/CreatePost";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useDispatch, useSelector } from "react-redux";
import Call from "../Call/Call";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));


const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme)
  })
}));

export default function Drawerr() {
  const theme = useTheme();
  const refe = React.useRef();
  const [open, setOpen] = React.useState(undefined);
  const dispatcher = useDispatch();
  const [file, setFile] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(undefined);
  const currView = useSelector((state) => state.view);
  const metaData = useSelector((state) => state.metaData);
  
  

  React.useEffect(() => {
    let openDrawer = window.innerWidth >= 768;
    setOpen(openDrawer);
    setIsMobile(!openDrawer);
    // dispatcher({type: currView, metaData: {...metaData, width: window.innerWidth, height: window.innerHeight}});

    window.addEventListener("resize", () => {
      let openDrawer = window.innerWidth >= 768;
      setOpen(openDrawer);
      setIsMobile(!openDrawer);
      // console.log("Drawer val ::", openDrawer);
      
      // dispatcher({type: currView, metaData: {...metaData, width: window.innerWidth, height: window.innerHeight}});

    });
  }, []);

  const handleDrawer = () => {
    setOpen(!open);
  };

  const handleFileChange = (event) => {
    if(event.target.files){
        const file_ = Array.from(event.target.files)[0];
        if(file_) {
          setFile(file_);
          dispatcher({type: "STORY", metaData: {file : file_}});
        }
    }
}


  const changeView = (index) => {
      switch(index) {
        case 0: dispatcher({type : "POSTS"});
                break;
        case 1: dispatcher({type : "PROFILE"});
          break;
        case 2: dispatcher({type : "SRUSER"});
          break;
        case 3: dispatcher({type : "CREATEPOST"});
          break;
        case 4: dispatcher({type : "MESSAGING"});
          break;
        case 5: {
          refe.current.click();
          break;
        }
        case 6: dispatcher({type : "TEST_VIDEO"});
          break;
        default: dispatcher({type : "POSTS"});
          break;
      }
  }

  return (
    <div className={(isMobile ? 'bottom-drawer' :'') + " drawer-container"}>
      <Drawer variant="permanent" open={open} anchor={isMobile ? "bottom" : "left"}>
        { isMobile ? null : 
          <>
            <DrawerHeader>
              <IconButton onClick={handleDrawer}>
                {!open ? <ChevronRightIcon /> :
                <ChevronLeftIcon /> }           
              </IconButton>
            </DrawerHeader>
            <Divider />
          </>}
        <List>
          {["Home", "Profile", "Search", "Create", "Messaging", "Story"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }} onClick={() => changeView(index)}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center"
                  }}
                >
                  {index === 0 && <Home />}
                  {index === 1 && <AccountCircle />}
                  {index === 2 && <PersonSearchIcon />}
                  {index === 3 && <AddCircleIcon/>}
                  {index === 4 && <TelegramIcon/>}
                  {index === 5 && 
                    <div>
                      <HistoryToggleOffIcon/>
                    </div>
                  }
                  {index === 6 && 
                    <div>
                      <LocalPhoneIcon/>
                    </div>
                  }
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <input ref={refe} style={{display: 'none'}} type="file" onChange={handleFileChange}/> 
                      
      </Drawer>
    </div>
  );
}
