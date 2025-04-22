package org.ssafy.tmt.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class ElasticSearchConfig {

    @Value("${ELASTIC}")
    private String elasticsearchUrl;

    @Bean
    public ElasticsearchClient elasticsearchClient() throws URISyntaxException {

        URI uri = new URI(elasticsearchUrl);
        String scheme = uri.getScheme(); // http 또는 https
        String host = uri.getHost();     // localhost 또는 IP
        int port = uri.getPort();        // 9200 등 포트번호

        RestClient restClient = RestClient.builder(
                new HttpHost(host, port, scheme)).build();
        RestClientTransport transport = new RestClientTransport(restClient,
                new JacksonJsonpMapper());
        return new ElasticsearchClient(transport);
    }
}

/*  RestClient restClient = RestClient.builder(
                new HttpHost("localhost", 9200, "http")).build();
        RestClientTransport transport = new RestClientTransport(restClient,
                new JacksonJsonpMapper());
        return new ElasticsearchClient(transport); */