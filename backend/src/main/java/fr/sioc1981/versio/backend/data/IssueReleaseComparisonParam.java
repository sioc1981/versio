package fr.sioc1981.versio.backend.data;

import java.util.List;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;

public class IssueReleaseComparisonParam {
	
	public static IssueReleaseComparisonParam valueOf(String jsonValue) {
		if (jsonValue == null || jsonValue.isBlank()) {
			return null;
		}
		Jsonb jsonb = JsonbBuilder.create();
		IssueReleaseComparisonParam res = jsonb.fromJson(jsonValue, IssueReleaseComparisonParam.class);
		return res;
	}

	private List<String> sourceReleases;

	private List<String> destReleases;

	public IssueReleaseComparisonParam() {
		super();
	}

	public List<String> getSourceReleases() {
		return sourceReleases;
	}

	public void setSourceReleases(List<String> sourceReleases) {
		this.sourceReleases = sourceReleases;
	}

	public List<String> getDestReleases() {
		return destReleases;
	}

	public void setDestReleases(List<String> destReleases) {
		this.destReleases = destReleases;
	}

}
