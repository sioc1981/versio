package fr.sioc1981.versioning.backend.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.ColumnResult;
import javax.persistence.ConstructorResult;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.MapsId;
import javax.persistence.NamedNativeQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SqlResultSetMapping;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import fr.sioc1981.versioning.backend.data.PlatformCount;
import fr.sioc1981.versioning.backend.data.ReleaseFullSummary;

/**
 * Entity implementation class for Entity: Patch
 *
 */
@Entity
@NamedNativeQuery(name = "releaseFullSummaryById", resultSetMapping = "releaseFullSummary", query = "SELECT "
		+ "r.id as id, v.versionnumber as version_number, COALESCE(p.patchcount,0) as patch_count, COALESCE(p.packagedpatchcount,0) as packaged_patch_count " +", "
		+ "CASE WHEN r.QUALIFICATION_DEPLOY_DATE IS NULL THEN false ELSE true END as qualification_deployed, "
		+ "CASE WHEN r.QUALIFICATION_VALIDATION_DATE IS NULL THEN false ELSE true END as qualification_validated, "
		+ "COALESCE(p.qualificationdeployedpatches, 0) as qualification_deployed_patches, COALESCE(p.qualificationvalidatedpatches, 0) as qualification_validated_patches, "
		+ "CASE WHEN r.KEYUSER_DEPLOY_DATE IS NULL THEN false ELSE true END as keyuser_deployed, "
		+ "CASE WHEN r.KEYUSER_VALIDATION_DATE IS NULL THEN false ELSE true END as keyuser_validated, "
		+ "COALESCE(p.keyuserdeployedpatches, 0) as keyuser_deployed_patches, COALESCE(p.keyuservalidatedpatches, 0) as keyuser_validated_patches, "
		+ "CASE WHEN r.PILOT_DEPLOY_DATE IS NULL THEN false ELSE true END as pilot_deployed, "
		+ "CASE WHEN r.PILOT_VALIDATION_DATE IS NULL THEN false ELSE true END as pilot_validated, "
		+ "COALESCE(p.pilotdeployedpatches, 0) as pilot_deployed_patches, COALESCE(p.pilotvalidatedpatches, 0) as pilot_validated_patches, "
		+ "CASE WHEN r.PRODUCTION_DEPLOY_DATE IS NULL THEN false ELSE true END as prodution_deployed, "
		+ "CASE WHEN r.PRODUCTION_VALIDATION_DATE IS NULL THEN false ELSE true END as prodution_validated, "
		+ "COALESCE(p.produtiondeployedpatches, 0) as prodution_deployed_patches, COALESCE(p.produtionvalidatedpatches, 0) as prodution_validated_patches "
		+ "FROM release as r join version as v on r.version_id=v.id "
		+ "left join (select release_id as release_id, count(id) as patchcount, count(packagedate) as packagedpatchcount, "
		+ "count(QUALIFICATION_DEPLOY_DATE) as qualificationdeployedpatches, count(QUALIFICATION_VALIDATION_DATE) as qualificationvalidatedpatches, "
		+ "count(KEYUSER_DEPLOY_DATE) as keyuserdeployedpatches, count(KEYUSER_VALIDATION_DATE) as keyuservalidatedpatches, "
		+ "count(PILOT_DEPLOY_DATE) as pilotdeployedpatches, count(PILOT_VALIDATION_DATE) as pilotvalidatedpatches, "
		+ "count(PRODUCTION_DEPLOY_DATE) as produtiondeployedpatches, count(PRODUCTION_VALIDATION_DATE) as produtionvalidatedpatches "
		+ "from patch group by release_id) as p on p.release_id = r.id "
		+ "WHERE r.id=:id")
@NamedNativeQuery(name = "releaseFullSummary", resultSetMapping = "releaseFullSummary", query = "SELECT "
		+ "r.id as id, v.versionnumber as version_number, COALESCE(p.patchcount,0) as patch_count, COALESCE(p.packagedpatchcount,0) as packaged_patch_count " +", "
		+ "CASE WHEN r.QUALIFICATION_DEPLOY_DATE IS NULL THEN false ELSE true END as qualification_deployed, "
		+ "CASE WHEN r.QUALIFICATION_VALIDATION_DATE IS NULL THEN false ELSE true END as qualification_validated, "
		+ "COALESCE(p.qualificationdeployedpatches, 0) as qualification_deployed_patches, COALESCE(p.qualificationvalidatedpatches, 0) as qualification_validated_patches, "
		+ "CASE WHEN r.KEYUSER_DEPLOY_DATE IS NULL THEN false ELSE true END as keyuser_deployed, "
		+ "CASE WHEN r.KEYUSER_VALIDATION_DATE IS NULL THEN false ELSE true END as keyuser_validated, "
		+ "COALESCE(p.keyuserdeployedpatches, 0) as keyuser_deployed_patches, COALESCE(p.keyuservalidatedpatches, 0) as keyuser_validated_patches, "
		+ "CASE WHEN r.PILOT_DEPLOY_DATE IS NULL THEN false ELSE true END as pilot_deployed, "
		+ "CASE WHEN r.PILOT_VALIDATION_DATE IS NULL THEN false ELSE true END as pilot_validated, "
		+ "COALESCE(p.pilotdeployedpatches, 0) as pilot_deployed_patches, COALESCE(p.pilotvalidatedpatches, 0) as pilot_validated_patches, "
		+ "CASE WHEN r.PRODUCTION_DEPLOY_DATE IS NULL THEN false ELSE true END as prodution_deployed, "
		+ "CASE WHEN r.PRODUCTION_VALIDATION_DATE IS NULL THEN false ELSE true END as prodution_validated, "
		+ "COALESCE(p.produtiondeployedpatches, 0) as prodution_deployed_patches, COALESCE(p.produtionvalidatedpatches, 0) as prodution_validated_patches "
		+ "FROM release as r join version as v on r.version_id=v.id "
		+ "left join (select release_id as release_id, count(id) as patchcount, count(packagedate) as packagedpatchcount, "
		+ "count(QUALIFICATION_DEPLOY_DATE) as qualificationdeployedpatches, count(QUALIFICATION_VALIDATION_DATE) as qualificationvalidatedpatches, "
		+ "count(KEYUSER_DEPLOY_DATE) as keyuserdeployedpatches, count(KEYUSER_VALIDATION_DATE) as keyuservalidatedpatches, "
		+ "count(PILOT_DEPLOY_DATE) as pilotdeployedpatches, count(PILOT_VALIDATION_DATE) as pilotvalidatedpatches, "
		+ "count(PRODUCTION_DEPLOY_DATE) as produtiondeployedpatches, count(PRODUCTION_VALIDATION_DATE) as produtionvalidatedpatches "
		+ "from patch group by release_id) as p on p.release_id = r.id ")
@SqlResultSetMapping(name = "releaseFullSummary", classes = {
		@ConstructorResult(targetClass = ReleaseFullSummary.class, columns = {
				@ColumnResult(name = "id", type = Long.class),
				@ColumnResult(name = "version_number", type = String.class),
				@ColumnResult(name = "patch_count", type = Integer.class),
				@ColumnResult(name = "packaged_patch_count", type = Integer.class) })
    ,
    @ConstructorResult(
            targetClass = PlatformCount.class,
            columns = {
                @ColumnResult(name = "qualification_deployed", type = Boolean.class),
                @ColumnResult(name = "qualification_validated", type = Boolean.class),
                @ColumnResult(name = "qualification_deployed_patches", type = Long.class),
                @ColumnResult(name = "qualification_validated_patches", type = Long.class)
            })
		,
		@ConstructorResult(
				targetClass = PlatformCount.class,
				columns = {
						@ColumnResult(name = "keyuser_deployed", type = Boolean.class),
						@ColumnResult(name = "keyuser_validated", type = Boolean.class),
						@ColumnResult(name = "keyuser_deployed_patches", type = Long.class),
						@ColumnResult(name = "keyuser_validated_patches", type = Long.class)
				})
		,
		@ConstructorResult(
				targetClass = PlatformCount.class,
				columns = {
						@ColumnResult(name = "pilot_deployed", type = Boolean.class),
						@ColumnResult(name = "pilot_validated", type = Boolean.class),
						@ColumnResult(name = "pilot_deployed_patches", type = Long.class),
						@ColumnResult(name = "pilot_validated_patches", type = Long.class)
				})
		,
		@ConstructorResult(
				targetClass = PlatformCount.class,
				columns = {
						@ColumnResult(name = "prodution_deployed", type = Boolean.class),
						@ColumnResult(name = "prodution_validated", type = Boolean.class),
						@ColumnResult(name = "prodution_deployed_patches", type = Long.class),
						@ColumnResult(name = "prodution_validated_patches", type = Long.class)
				})

})
@JsonIgnoreProperties(ignoreUnknown=true)
public class ReleaseFull implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	private Long id;

	@OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "id")
	@MapsId
	private Release release;

	@ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
	private Set<Issue> issues;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "release_id")
	private Set<Patch> patches;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Release getRelease() {
		return release;
	}

	public void setRelease(Release release) {
		this.release = release;
	}

	public Set<Issue> getIssues() {
		return issues;
	}

	public void setIssues(Set<Issue> issues) {
		this.issues = issues;
	}

	public Set<Patch> getPatches() {
		return patches;
	}

	public void setPatches(Set<Patch> patches) {
		this.patches = patches;
	}

	@Override
	public int hashCode() {
		return Objects.hash(release);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ReleaseFull other = (ReleaseFull) obj;
		return
//				Objects.equals(id, other.id) && 
		Objects.equals(issues, other.issues) && Objects.equals(patches, other.patches)
				&& Objects.equals(release, other.release);
	}

	@Override
	public String toString() {
		return String.format("ReleaseFull [release=%s, issues=%s, patches=%s]", release, issues, patches);
	}

}
