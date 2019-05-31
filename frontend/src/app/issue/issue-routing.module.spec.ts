import { IssueRoutingModule } from './issue-routing.module';

describe('IssueRoutingModule', () => {
  let issueRoutingModule: IssueRoutingModule;

  beforeEach(() => {
    issueRoutingModule = new IssueRoutingModule();
  });

  it('should create an instance', () => {
    expect(issueRoutingModule).toBeTruthy();
  });
});
