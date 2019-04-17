package fr.sioc1981.versioning.backend.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
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

	private SseBroadcaster sseBroadcaster;

	@PostConstruct
	public void init() {
		sseBroadcaster = sse.newBroadcaster();
		sseBroadcaster.onClose(eventSink -> {
			LOG.warn("Connection lost for sink {}", System.identityHashCode(eventSink));
		});
	}

	@PreDestroy
	public void destroy() {
		sseBroadcaster.close();
	}


	@GET
	@Produces(MediaType.SERVER_SENT_EVENTS)
	public void register(final @Context SseEventSink eventSink) {
		data.forEach((k, v) -> {
			eventSink.send(
					sse.newEventBuilder().data(generateData(k, v)).mediaType(MediaType.APPLICATION_JSON_TYPE).build());
		});
		LOG.info("Register a new Sink {}", System.identityHashCode(eventSink));
		sseBroadcaster.register(eventSink);
	}

	private Map<String, Object> generateData(String k, Object v) {
		List<String> keys = Arrays.asList(k.split("_"));
		Collections.reverse(keys);
		Map<String, Object> res = null;
		for (String key : keys) {
			res = Map.of(key, res != null ? res : v);
		}
		return res;
	}

	public <T> void broadcast(String type, T value) {
		LOG.info("send new value {} of type {}", value, type);
		data.put(type, value);
		sseBroadcaster.broadcast(sse.newEventBuilder().data(generateData(type, value))
				.mediaType(MediaType.APPLICATION_JSON_TYPE).build());
	}
}
