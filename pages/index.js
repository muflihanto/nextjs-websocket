import io from "Socket.IO-client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Textarea, Container, Text, Button, Stack, List, ListItem, ListIcon, Divider, useToast } from "@chakra-ui/react";
import { MdCheckCircle } from "@react-icons/all-files/md/MdCheckCircle";
import { MdDeleteForever } from "@react-icons/all-files/md/MdDeleteForever";
import { FiCopy } from "@react-icons/all-files/fi/FiCopy";
import copy from "copy-to-clipboard";
let socket;

const Home = () => {
  const [input, setInput] = useState("");
  const [clipboard, setClipboard] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/socket");
      socket = io("http://192.168.8.2:3000");
      socket.on("update-input", (msg) => {
        setInput(msg);
      });
      socket.on("update-clipboard", (msg) => {
        setClipboard(msg);
      });
    };
    socketInitializer();
  }, []);

  const onChangeHandler = (e) => {
    setInput(e.target.value);
    socket.emit("input-change", e.target.value);
  };

  const onClickHandler = (e) => {
    const { id } = e.target;
    let clipEmitVal = [];
    if (id === "add") {
      if (input) {
        clipEmitVal = [...clipboard, input];
        setClipboard((prev) => {
          return [...prev, input];
        });
        socket.emit("clipboard-change", clipEmitVal);
        setInput("");
        socket.emit("input-change", "");
      }
    } else if (id === "remove") {
      const cln = clipboard.length;
      if (cln > 0) {
        clipEmitVal = clipboard.slice(0, cln - 1);
        setClipboard((prev) => {
          return prev.slice(0, prev.length - 1);
        });
        socket.emit("clipboard-change", clipEmitVal);
      }
    } else if (id === "reset") {
      setInput("");
      setClipboard([]);
      socket.emit("input-change", "");
      socket.emit("clipboard-change", []);
    } else if (id.split("-")[0] === "clip") {
      const clipIdx = parseInt(id.split("-")[1]);
      const cln = clipboard.length;
      clipEmitVal = [...clipboard.slice(0, clipIdx), ...clipboard.slice(clipIdx + 1, cln)];
      setClipboard((prev) => {
        return [...prev.slice(0, clipIdx), ...prev.slice(clipIdx + 1, cln)];
      });
      socket.emit("clipboard-change", clipEmitVal);
    }
  };

  const clipElement = clipboard.map((clip, idx) => {
    return (
      <ListItem
        key={idx + 1}
        position="relative"
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            cursor: "pointer",
            marginRight: "10px",
          }}
          data-peer
          role="group"
          onClick={(e) => onClickHandler(e)}
          id={`clip-${idx}`}
        >
          <ListIcon
            _groupHover={{
              position: "relative",
              transition: "100ms",
              opacity: 0,
              zIndex: "-1",
              cursor: "pointer",
            }}
            as={MdCheckCircle}
            color="green.500"
          />
        </div>
        <ListIcon
          onClick={(e) => onClickHandler(e)}
          as={MdDeleteForever}
          color="#FFFFFF00"
          style={{
            position: "absolute",
            marginBlock: "7px",
            left: "0px",
            zIndex: "-1",
          }}
          _peerHover={{
            transition: "250ms",
            color: "red.500",
            transform: "scale(120%)",
            cursor: "pointer",
          }}
        />
        <ListIcon
          onClick={() => {
            copy(clip);
            toast({
              title: `${clip} copied`,
              status: "success",
              variant: "left-accent",
              duration: 1500,
              isClosable: true,
            });
          }}
          as={FiCopy}
          _active={{
            transform: "scale(80%)",
          }}
          marginLeft="-5px"
          marginRight="10px"
          cursor="pointer"
        />
        <Text as="samp">{clip}</Text>
      </ListItem>
    );
  });

  return (
    <>
      <Head>
        <title>Next Clip</title>
      </Head>
      <Container padding="20px">
        <Text
          fontSize="2xl"
          fontWeight="bold"
        >
          Next Clip
        </Text>
        <Textarea
          variant="filled"
          marginBlock="10px"
          rows="7"
          placeholder="Type something"
          value={input}
          onChange={(e) => onChangeHandler(e)}
          autoFocus
        />
        <Stack
          direction="row"
          spacing={4}
          align="center"
        >
          <Button
            id="add"
            onClick={(e) => onClickHandler(e)}
            colorScheme="teal"
            variant="solid"
          >
            Add
          </Button>
          <Button
            id="reset"
            onClick={(e) => onClickHandler(e)}
            colorScheme="teal"
            variant="ghost"
          >
            Reset
          </Button>
        </Stack>
        <Divider marginBlock="15px 5px" />
        <List marginTop="10px">{clipElement}</List>
      </Container>
    </>
  );
};

export default Home;
