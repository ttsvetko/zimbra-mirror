package org.jivesoftware.wildfire.net;

import org.jivesoftware.util.LocaleUtils;
import org.jivesoftware.util.Log;
import org.jivesoftware.wildfire.ConnectionManager;
import org.jivesoftware.wildfire.ServerPort;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.DefaultIoFilterChainBuilder;
import org.apache.mina.common.IdleStatus;
import org.apache.mina.common.IoAcceptor;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.IoSession;
import org.apache.mina.common.TransportType;
import org.apache.mina.transport.socket.nio.SocketAcceptor;
import org.apache.mina.transport.socket.nio.SocketSessionConfig;

public class NioAcceptingMode extends SocketAcceptingMode {

    private static final String HANDLER = NioAcceptingMode.class.getName() + ".h";
    
    class XMPPIoHandlerAdapter extends IoHandlerAdapter  {
        
        public void exceptionCaught(IoSession session, Throwable cause) throws Exception {
            Log.info("Exception caught for session: " + session.toString() + " Caused by: " +cause.toString());
            cause.printStackTrace();
            super.exceptionCaught(session, cause);
        }
        
        public void messageSent(IoSession session, Object message) throws Exception {
            Log.info("Message send for session: "+session.toString());
            super.messageSent(session, message);
        }
        
        public void sessionClosed(IoSession session) throws Exception {
            Log.info("Session closed: "+session.toString());
            
            NioCompletionHandler handler = (NioCompletionHandler)(session.getAttribute(HANDLER));
            handler.nioClosed();
            super.sessionClosed(session);
        }
        
        public void sessionCreated(IoSession session) throws Exception {
            Log.info("Session created: " + session.toString());
            
            try {
                if( session.getTransportType() == TransportType.SOCKET )
                {
                    ( ( SocketSessionConfig ) session.getConfig() ).setReceiveBufferSize( 128 );
                    session.setIdleTime( IdleStatus.BOTH_IDLE,  60 * 30); // 30 minute idle                    
                }

                SocketReader reader = connManager.createSocketReader(session, false, serverPort);
                NioCompletionHandler handler = reader.getNioCompletionHandler();
                session.setAttribute(HANDLER, handler);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            super.sessionCreated(session);
        }
        
        public void sessionIdle(IoSession session, IdleStatus status) throws Exception {
            Log.info("Session idle: "+session.toString() + " status "+status.toString());
            super.sessionIdle(session, status);
        }

        public void sessionOpened(IoSession session) throws Exception {
            Log.info("Session opened: " + session.toString());
            super.sessionOpened(session);
        }

        public void messageReceived( IoSession session, Object buf ) {
            if( !( buf instanceof ByteBuffer ) ) { // check your imports: should be org.apache.mina.common.ByteBuffer, not java.nio!
                return;
            }
            
            NioCompletionHandler handler = (NioCompletionHandler)(session.getAttribute(HANDLER));
            handler.nioReadCompleted((ByteBuffer)buf);
        }

    }
    
    private XMPPIoHandlerAdapter mIoAdapter = null;
    
    /**
     * @param connManager
     * @param serverPort
     * @param bindInterface
     * @throws IOException
     */
    NioAcceptingMode(ConnectionManager connManager, ServerPort serverPort, InetAddress bindInterface) throws IOException {
        super(connManager, serverPort);
        
        mIoAdapter = new XMPPIoHandlerAdapter();
    }

    /* (non-Javadoc)
     * @see org.jivesoftware.wildfire.net.SocketAcceptingMode#shutdown()
     */
    public void shutdown() {
        super.shutdown();
    }


    /* 
     * NIO Accept Mainloop
     */
    public void run() {
        IoAcceptor acceptor = new SocketAcceptor();
        DefaultIoFilterChainBuilder chain = acceptor.getFilterChain();
        System.out.println(chain);

        InetSocketAddress addr = new InetSocketAddress( serverPort.getPort() ); 

        try {
            acceptor.bind(addr, mIoAdapter);

        } catch (IOException ie) {
            if (notTerminated) {
                Log.error(LocaleUtils.getLocalizedString("admin.error.accept"),
                            ie);
            }
        }


        System.out.println( "Listening on port " + addr );
    }        



}
