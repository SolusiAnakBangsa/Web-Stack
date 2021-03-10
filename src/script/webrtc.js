class PeerObj {
    /*
        Peer objects accepts one argument: ID.
        Creates a peer with ID in the server.
        If an peer with the same ID exists, it will throw an error.

        This peer implementation supports only one connection.
    */
    constructor() {
        this.peer; // Peer object.
        this.connection = new ConnectionObj(); // Connection object to send and receive data.
        this.opened = false; // Whether the peer has been opened.
        this._queueConnect; // Queue to connect to other clients, when the peer has been opened.
    }

    _openConnection(id) {
        // Open connection to other peer using the id.
        this.connection.init(this.peer.connect(id,
            {config:
                {'reliable' : 'true'}
            }
        ));
    }

    init(id){
        // Configure and create new peer
        // Using the id in the function
        this.peer = new Peer(id,
            {
                host:'rtc.gameyourfit.com',
                secure:false,
                port:6311,
                config:
                    {
                    'iceServers': [
                        {url: 'stun:stun.l.google.com:19302'},
                        {url: 'turn:rtc.gameyourfit.com:3478', username: 'test', credential: 'test123' }
                        ]
                    },
                debug: 1
            }
        );
        
        this.peer.on('open', (id) => {
            console.log("Peer made with ID : " + id);
            // If queue is already supplied with id to connect to, make connection.
            if (this._queueConnect != undefined) {
                this._openConnection(this._queueConnect);
            }
            this.opened = true;
        });

        this.peer.on('connection',function(conn){
            // When this peer accepts a connection, make another
            // connection object to store it.
            console.log("Connected");
            this.connection.init(conn);
        });

        this.peer.on('error', function(err){
            // Handle error
            console.log("webrtc error " + err);
        });
    }

    // Connect to other peer.
    connectTo(destinationID){
        // Make the connection object with the other object
        console.log("Attempting connection with: " + destinationID);

        // If the peer has been opened, then open the connection immedieately.
        // else, queue the connection to be made as soon as the peer is made.
        if (this.opened) {
            this._openConnection(destinationID);
        } else {
            this._queueConnect = destinationID;
        }
    }

    isConnected() {
        return this.connection == null;
    }
}

class ConnectionObj {

    constructor() {
        this.connection;
        this.eventQueue = {};
        this.callbacks = []; // All functions to run when the connection receives something.
    }

    init(connection) {
        /*
            The only argument is the connection object between this object
            to the directed peer. The connection object is made through peer.connect()
        */
        this.connection = connection;

        this.connection.on('open', () => {
            console.log(`Connection succesfully made with "${this.connection.peer}"`);
        });

        // Adds all the events
        for (const ev in this.eventQueue) {
            this.connection.on(ev, this.eventQueue[ev]);
        }

        // and the listener too.
        this._initializeListener();
    }

    addEvents(event, func) {
        // Add events to webrtc peer object before it begins.
        this.eventQueue[event] = func;
    }

    _initializeListener() {
        this.connection.on('data', (payload) => {
            this._onReceiveData(payload);
        });
    }

    _onReceiveData(payload) {
        for (let c of this.callbacks) {
            c(payload);
        }
    }

    sendData(data){
        // Sends data to the established connection, prints error if connection is lost.
        try{
            this.connection.send(data);
            console.log("Local sent: " + data);
        }
        catch(err) {
            console.log("Connection lost with " + this.connection);
        }
    }

    addReceiveHandler(func) {
        /*
            This is to add new handler when this connection receives a new data from
            the other client.
            This will be added to onReceiveData.
        */
       this.callbacks.push(func);
    }
}

export const peer = new PeerObj();