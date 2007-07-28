SET ZIMBRA_HOME=/opt/zimbra/zdesktop

java -Xms64m -Xmx256m -Dsun.net.inetaddr.ttl=30 -DSTART=%ZIMBRA_HOME%/jetty/etc/start.config -Dzimbra.config=%ZIMBRA_HOME%/conf/localconfig.xml -Djava.library.path=%ZIMBRA_HOME%/lib -cp %ZIMBRA_HOME%/lib/zdesktop.jar:%ZIMBRA_HOME%/jetty/start.jar com.zimbra.cs.offline.start.Main org.mortbay.start.Main 2> nul

