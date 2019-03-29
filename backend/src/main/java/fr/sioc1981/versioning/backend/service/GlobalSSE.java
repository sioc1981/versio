package fr.sioc1981.versioning.backend.service;

import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseBroadcaster;
import javax.ws.rs.sse.SseEventSink;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
@Path("/subscribe")
public class GlobalSSE {

	private static final Logger LOG = LoggerFactory.getLogger(GlobalSSE.class);

	@Context
	private Sse sse;

	private final ConcurrentHashMap<String, Object> data = new ConcurrentHashMap<String, Object>();

	private static SseBroadcaster sseBroadcaster;

	@PostConstruct
	public void init() {
		LOG.warn("GlobalSSE.init");
		GlobalSSE.sseBroadcaster = sse.newBroadcaster();
		sseBroadcaster.onClose(
				ses -> LOG.warn("Connection lost for sink {} in {}", System.identityHashCode(ses), sseBroadcaster));
	}

	@GET
	@Produces(MediaType.SERVER_SENT_EVENTS)
	public void register(final @Context SseEventSink eventSink) {
		data.forEach((k, v) -> {
			eventSink.send(sse.newEventBuilder().data(k + "=" + v).mediaType(MediaType.APPLICATION_JSON_TYPE).build());
		});
		LOG.info("Register a new Sink {}", System.identityHashCode(eventSink));
		sseBroadcaster.register(eventSink);
	}

	public <T> void broadcast(String type, T value) {
		LOG.info("send new value {} of type {}", value, type);
		data.put(type, value);
		sseBroadcaster.broadcast(
				sse.newEventBuilder().data(type + "=" + value).mediaType(MediaType.APPLICATION_JSON_TYPE).build());
	}
}
