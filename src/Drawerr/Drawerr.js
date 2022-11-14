import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Home from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";
import * as React from "react";
import './Drawerr.css';
import SearchUser from "../SearchUser/SearchUser";
import CreatePost from "../CreatePost/CreatePost";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useDispatch } from "react-redux";

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
  const [open, setOpen] = React.useState(true);
  const dispatcher = useDispatch();

  const handleDrawer = () => {
    setOpen(!open);
  };

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
        default: dispatcher({type : "POSTS"});
          break;
      }
  }

  return (
    <div className="drawer-container">
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawer}>
            
              {!open ? <ChevronRightIcon /> :
              <ChevronLeftIcon /> }
            
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {["Home", "Profile", "Search", "Create", "Messaging"].map((text, index) => (
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
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}
