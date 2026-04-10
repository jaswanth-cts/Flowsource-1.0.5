
import {
  Entity,
} from '@backstage/catalog-model';

/**
 * Backstage catalog Environment kind Entity. Environments are used to define
 * the various environments in which services are deployed.
 *
 * @public
 */
export interface EnvironmentEntityV1 extends Entity {
  /**
   * The apiVersion string of the EnvironmentEntity.
   */
  apiVersion: 'flowsource/v1';
  /**
   * The kind of the entity
   */
  kind: 'Environment';
  /**
   * The specification of the Environment Entity
   */
  spec: {
    /**
     * The name of the environment.
     */
    name: string;
    /**
     * The description of the environment.
     */
    description?: string;
    /**
     * The owner of the environment.
     */
    owner?: string;
    /**
     * The namespace of the environment.
     */
    namespace?: string;
    /**
     * Dependencies of the environment.
     * This is a list of other entities that this environment depends on.
     */
    dependsOn?: string[];
    /**
     * The list of entities that depend on this environment.
     * This is used to track reverse dependencies.
     */
    dependencyOf?: string[];
    /**
     * The subcomponent of the environment.
     * This is used to track the relationship between environments and components.
     */
    subcomponentOf?: string;
    /**
     * The system that this environment is part of.
     */
    system?: string;
  };
}
