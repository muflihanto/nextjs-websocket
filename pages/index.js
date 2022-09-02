import io from "Socket.IO-client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Textarea, Container, Text, Button, Flex, Stack, List, ListItem, ListIcon, Divider, useToast, Icon, Editable, EditableInput, EditablePreview } from "@chakra-ui/react";
import { MdDeleteForever, MdCancel } from "react-icons/md";
import { FiCopy, FiScissors } from "react-icons/fi";
import copy from "copy-to-clipboard";
let socket;

const Home = () => {
  const [input, setInput] = useState("");
  const [clipboard, setClipboard] = useState([]);
  const [room, setRoom] = useState({ name: "", isJoined: false });

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
    socket.emit("input-change", { room, msg: e.target.value });
  };

  const onClickHandler = (e) => {
    const { id } = e.target;
    let clipEmitVal = [];
    if (id === "add") {
      if (input) {
        clipEmitVal = [input, ...clipboard];
        setClipboard((prev) => {
          return [input, ...prev];
        });
        socket.emit("clipboard-change", { room, msg: clipEmitVal });
        setInput("");
        socket.emit("input-change", { room, msg: "" });
      }
    } else if (id === "reset") {
      setInput("");
      setClipboard([]);
      socket.emit("input-change", { room, msg: "" });
      socket.emit("clipboard-change", { room, msg: [] });
    } else if (id.split("-")[0] === "clip") {
      const clipIdx = parseInt(id.split("-")[1]);
      toast({
        title: `${clipboard.slice(clipIdx, clipIdx + 1)} deleted`,
        status: "success",
        variant: "left-accent",
        duration: 1500,
        isClosable: true,
      });
      const cln = clipboard.length;
      clipEmitVal = [...clipboard.slice(0, clipIdx), ...clipboard.slice(clipIdx + 1, cln)];
      setClipboard((prev) => {
        return [...prev.slice(0, clipIdx), ...prev.slice(clipIdx + 1, cln)];
      });
      socket.emit("clipboard-change", { room, msg: clipEmitVal });
    }
  };

  function handleRoomInput(e) {
    setRoom((prev) => ({ ...prev, name: e.target.value }));
  }
  function handleJoinRoom() {
    if (room !== "") {
      if (!room.isJoined) {
        setRoom((prev) => ({ ...prev, isJoined: true }));
        socket.emit("join-room", room.name);
        toast({
          title: `Joined ${room.name}`,
          status: "success",
          variant: "left-accent",
          duration: 1500,
          isClosable: true,
        });
      } else {
        socket.emit("leave-room", room.name);
        toast({
          title: `Leaving ${room.name} ...`,
          status: "success",
          variant: "left-accent",
          duration: 1500,
          isClosable: true,
        });
        setInput("");
        setClipboard([]);
        setRoom({ name: "", isJoined: false });
      }
    }
  }

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
            as={MdCancel}
            color="red.500"
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
        <Flex align="center">
          <Editable
            marginBlock="2"
            fontFamily={"mono"}
            placeholder="room id"
            isDisabled={room.isJoined}
            value={room.name}
            width="full"
            marginRight={2}
          >
            <EditablePreview
              paddingInline={2}
              marginRight={2}
              opacity={room.isJoined ? 1 : 0.5}
              width="full"
            />
            <EditableInput
              paddingInline={2}
              onChange={(e) => handleRoomInput(e)}
            />
          </Editable>
          <Button
            colorScheme="teal"
            size="sm"
            marginLeft={"auto"}
            onClick={handleJoinRoom}
          >
            {room.isJoined ? "Leave" : "Join"}
          </Button>
        </Flex>
        <div
          style={{
            position: "relative",
          }}
        >
          <Textarea
            variant="filled"
            marginBlock="10px"
            rows="7"
            placeholder="Type something"
            value={input}
            onChange={(e) => onChangeHandler(e)}
            isDisabled={!room.isJoined}
          />
          <Button
            onClick={() => {
              copy(input);
              toast({
                title: `${input} copied`,
                status: "success",
                variant: "left-accent",
                duration: 1500,
                isClosable: true,
              });
            }}
            style={{
              position: "absolute",
              top: "12px",
              right: "2px",
              transform: "scale(70%)",
            }}
            colorScheme="blackAlpha"
            variant="solid"
          >
            <Icon
              as={FiCopy}
              style={{ transform: "scale(120%)" }}
              color="gray.50"
            />
          </Button>
          <Button
            onClick={() => {
              copy(input);
              setInput("");
              socket.emit("input-change", "");
              toast({
                title: `${input} copied`,
                status: "success",
                variant: "left-accent",
                duration: 1500,
                isClosable: true,
              });
            }}
            style={{
              position: "absolute",
              top: "12px",
              right: "40px",
              transform: "scale(70%)",
            }}
            colorScheme="blackAlpha"
            variant="solid"
          >
            <Icon
              as={FiScissors}
              style={{ transform: "scale(120%)" }}
              color="gray.50"
            />
          </Button>
        </div>
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
