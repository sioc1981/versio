/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with  the terms of the License at:
 * https://github.com/javaee/tutorial-examples/LICENSE.txt
 */
package fr.sioc1981.versio.backend.batch.notify.email;

import java.io.Serializable;
import java.util.List;

import javax.annotation.Resource;
import javax.batch.api.chunk.ItemWriter;
import javax.batch.runtime.context.JobContext;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fr.sioc1981.versio.backend.batch.data.ItemNumberCheckpoint;

/* Writer artifact.
 * Write each bill to a text file.
 */
@Dependent
@Named("EmailNotifierWriter")
public class EmailNotifierWriter implements ItemWriter {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	
    @Inject
    JobContext jobCtx;
	
	@Resource(name = "java:jboss/mail/Default")
	private Session session;
    
	private StringBuffer buffer;
    
    @Override
    public void open(Serializable ckpt) throws Exception {
    	buffer = new StringBuffer();
    }

    @Override
    public void close() throws Exception {
		try {
			Message message = new MimeMessage(session);
			message.setFrom(new InternetAddress("Versio Service <no-reply@sioc1981.fr>"));
			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("Receiver <receiver@sioc1981.fr>"));
			message.setSubject("Missing patches");
			message.setText(buffer.toString());

			Transport.send(message);

		} catch (MessagingException e) {
			log.warn("Cannot send mail", e);
		}
    	
    }

    @Override
    public void writeItems(List<Object> list) throws Exception {
		for (Object contentObject: list) {
			String content = (String) contentObject;
			buffer.append(content);
        }
    }

    @Override
    public Serializable checkpointInfo() throws Exception {
        return new ItemNumberCheckpoint();
    }
    
}
