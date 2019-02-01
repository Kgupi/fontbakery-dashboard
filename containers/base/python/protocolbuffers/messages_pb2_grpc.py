# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
import grpc

from google.protobuf import any_pb2 as google_dot_protobuf_dot_any__pb2
from google.protobuf import empty_pb2 as google_dot_protobuf_dot_empty__pb2
import messages_pb2 as messages__pb2


class StorageStub(object):
  """The Storage service

  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.Put = channel.stream_stream(
        '/fontbakery.dashboard.Storage/Put',
        request_serializer=messages__pb2.StorageItem.SerializeToString,
        response_deserializer=messages__pb2.StorageKey.FromString,
        )
    self.Get = channel.unary_unary(
        '/fontbakery.dashboard.Storage/Get',
        request_serializer=messages__pb2.StorageKey.SerializeToString,
        response_deserializer=google_dot_protobuf_dot_any__pb2.Any.FromString,
        )
    self.Purge = channel.unary_unary(
        '/fontbakery.dashboard.Storage/Purge',
        request_serializer=messages__pb2.StorageKey.SerializeToString,
        response_deserializer=messages__pb2.StorageStatus.FromString,
        )


class StorageServicer(object):
  """The Storage service

  """

  def Put(self, request_iterator, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Get(self, request, context):
    """Sends another greeting
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Purge(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_StorageServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'Put': grpc.stream_stream_rpc_method_handler(
          servicer.Put,
          request_deserializer=messages__pb2.StorageItem.FromString,
          response_serializer=messages__pb2.StorageKey.SerializeToString,
      ),
      'Get': grpc.unary_unary_rpc_method_handler(
          servicer.Get,
          request_deserializer=messages__pb2.StorageKey.FromString,
          response_serializer=google_dot_protobuf_dot_any__pb2.Any.SerializeToString,
      ),
      'Purge': grpc.unary_unary_rpc_method_handler(
          servicer.Purge,
          request_deserializer=messages__pb2.StorageKey.FromString,
          response_serializer=messages__pb2.StorageStatus.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.Storage', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class ManifestStub(object):
  """The Manifest service

  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.Poke = channel.unary_unary(
        '/fontbakery.dashboard.Manifest/Poke',
        request_serializer=messages__pb2.ManifestSourceId.SerializeToString,
        response_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
        )
    self.Get = channel.unary_unary(
        '/fontbakery.dashboard.Manifest/Get',
        request_serializer=messages__pb2.FamilyRequest.SerializeToString,
        response_deserializer=messages__pb2.FamilyData.FromString,
        )
    self.List = channel.unary_unary(
        '/fontbakery.dashboard.Manifest/List',
        request_serializer=messages__pb2.ManifestSourceId.SerializeToString,
        response_deserializer=messages__pb2.FamilyNamesList.FromString,
        )


class ManifestServicer(object):
  """The Manifest service

  """

  def Poke(self, request, context):
    """FIXME: this is outdated but may have some good bits!
    check for updates and emit a notice if since the last poke families
    were updated
    so if there's a change, we'll download it directly and put the files
    ordered into a Files message. The sha256 hash is what we emit as
    a change message ManifestKey: (manifiestid/collectionid, family name, filesHash)
    PokeResponse, is basically nothing, just a OK message ... how to do this
    best with grpc?
    Maybe we could directly send this to the cache?
    If we need to re-run an entiren Collection, because Font Bakery changed,
    we still need the latest versions of the collection on disk.
    so, it would be nice to have some form of atomicity between asking the
    informing the ManifestMaster and running the tests. Therefore, we could
    just put the entire current state into the cache and then let the
    ManifestMaster decide which ones to keep and which ones to drop.
    The Manifest itselt can in the meantime update itself etc.
    I.e. We create a "Snapshot" of the manifest in the cache, then
    we can forget about it
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Get(self, request, context):
    """This is the same data as the manifestSource would dispatch as
    CollectionFamilyJob for Font Bakery.
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def List(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_ManifestServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'Poke': grpc.unary_unary_rpc_method_handler(
          servicer.Poke,
          request_deserializer=messages__pb2.ManifestSourceId.FromString,
          response_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
      ),
      'Get': grpc.unary_unary_rpc_method_handler(
          servicer.Get,
          request_deserializer=messages__pb2.FamilyRequest.FromString,
          response_serializer=messages__pb2.FamilyData.SerializeToString,
      ),
      'List': grpc.unary_unary_rpc_method_handler(
          servicer.List,
          request_deserializer=messages__pb2.ManifestSourceId.FromString,
          response_serializer=messages__pb2.FamilyNamesList.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.Manifest', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class ReportsStub(object):
  """The Reports service

  Provides interfaces to read the data, get listings/filter.
  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.File = channel.unary_unary(
        '/fontbakery.dashboard.Reports/File',
        request_serializer=messages__pb2.Report.SerializeToString,
        response_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
        )
    self.Query = channel.unary_stream(
        '/fontbakery.dashboard.Reports/Query',
        request_serializer=messages__pb2.ReportsQuery.SerializeToString,
        response_deserializer=messages__pb2.Report.FromString,
        )
    self.Get = channel.unary_stream(
        '/fontbakery.dashboard.Reports/Get',
        request_serializer=messages__pb2.ReportIds.SerializeToString,
        response_deserializer=messages__pb2.Report.FromString,
        )


class ReportsServicer(object):
  """The Reports service

  Provides interfaces to read the data, get listings/filter.
  """

  def File(self, request, context):
    """to file the report ("file" as a verb, but by convention first letter uppercased)
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Query(self, request, context):
    """Get a list of reports including selection/filtering etc.
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Get(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_ReportsServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'File': grpc.unary_unary_rpc_method_handler(
          servicer.File,
          request_deserializer=messages__pb2.Report.FromString,
          response_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
      ),
      'Query': grpc.unary_stream_rpc_method_handler(
          servicer.Query,
          request_deserializer=messages__pb2.ReportsQuery.FromString,
          response_serializer=messages__pb2.Report.SerializeToString,
      ),
      'Get': grpc.unary_stream_rpc_method_handler(
          servicer.Get,
          request_deserializer=messages__pb2.ReportIds.FromString,
          response_serializer=messages__pb2.Report.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.Reports', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class ProcessManagerStub(object):
  """The Process Manager service ...

  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.SubscribeProcess = channel.unary_stream(
        '/fontbakery.dashboard.ProcessManager/SubscribeProcess',
        request_serializer=messages__pb2.ProcessQuery.SerializeToString,
        response_deserializer=messages__pb2.ProcessState.FromString,
        )
    self.GetProcess = channel.unary_unary(
        '/fontbakery.dashboard.ProcessManager/GetProcess',
        request_serializer=messages__pb2.ProcessQuery.SerializeToString,
        response_deserializer=messages__pb2.ProcessState.FromString,
        )
    self.Execute = channel.unary_unary(
        '/fontbakery.dashboard.ProcessManager/Execute',
        request_serializer=messages__pb2.ProcessCommand.SerializeToString,
        response_deserializer=messages__pb2.ProcessCommandResult.FromString,
        )
    self.InitProcess = channel.unary_unary(
        '/fontbakery.dashboard.ProcessManager/InitProcess',
        request_serializer=google_dot_protobuf_dot_any__pb2.Any.SerializeToString,
        response_deserializer=messages__pb2.ProcessCommandResult.FromString,
        )
    self.GetInitProcessUi = channel.unary_unary(
        '/fontbakery.dashboard.ProcessManager/GetInitProcessUi',
        request_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
        response_deserializer=messages__pb2.ProcessState.FromString,
        )


class ProcessManagerServicer(object):
  """The Process Manager service ...

  """

  def SubscribeProcess(self, request, context):
    """returns the current Process state initially and on each change of
    the Process state a new Process
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def GetProcess(self, request, context):
    """same as SubscribeProcess but only returns the current state once
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Execute(self, request, context):
    """issue a state change for a Process. `ticket` will be used to make
    sure only expected commands are executed.
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def InitProcess(self, request, context):
    """the any will have to unpack to a specific message defined in the
    ProcessManagerImplementation. e.g. DispatcherProcessManager will
    expect here a DispatcherInitProcess
    this may also be part of making it possible to create different
    kinds of processes in the same process manager.
    but right now we only deal with one process implementation at a time!
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def GetInitProcessUi(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_ProcessManagerServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'SubscribeProcess': grpc.unary_stream_rpc_method_handler(
          servicer.SubscribeProcess,
          request_deserializer=messages__pb2.ProcessQuery.FromString,
          response_serializer=messages__pb2.ProcessState.SerializeToString,
      ),
      'GetProcess': grpc.unary_unary_rpc_method_handler(
          servicer.GetProcess,
          request_deserializer=messages__pb2.ProcessQuery.FromString,
          response_serializer=messages__pb2.ProcessState.SerializeToString,
      ),
      'Execute': grpc.unary_unary_rpc_method_handler(
          servicer.Execute,
          request_deserializer=messages__pb2.ProcessCommand.FromString,
          response_serializer=messages__pb2.ProcessCommandResult.SerializeToString,
      ),
      'InitProcess': grpc.unary_unary_rpc_method_handler(
          servicer.InitProcess,
          request_deserializer=google_dot_protobuf_dot_any__pb2.Any.FromString,
          response_serializer=messages__pb2.ProcessCommandResult.SerializeToString,
      ),
      'GetInitProcessUi': grpc.unary_unary_rpc_method_handler(
          servicer.GetInitProcessUi,
          request_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
          response_serializer=messages__pb2.ProcessState.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.ProcessManager', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class DispatcherProcessManagerStub(object):
  """This service is added next to the ProcessManager service, it
  implements specific interfaces for the Font Bakery DispatcherProcessManager
  In this case things that can't be done without specific knowledge about
  how the specific process implementation (FamilyPRDispatcherProcess)
  is stored in the database and thus, how to query them.
  FamilyPRDispatcherProcess adds an important "family" name key to it's
  state which is used as a secondary key in the database and has no
  semantic/use in other implementations.
  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.SubscribeProcessList = channel.unary_stream(
        '/fontbakery.dashboard.DispatcherProcessManager/SubscribeProcessList',
        request_serializer=messages__pb2.ProcessListQuery.SerializeToString,
        response_deserializer=messages__pb2.ProcessList.FromString,
        )


class DispatcherProcessManagerServicer(object):
  """This service is added next to the ProcessManager service, it
  implements specific interfaces for the Font Bakery DispatcherProcessManager
  In this case things that can't be done without specific knowledge about
  how the specific process implementation (FamilyPRDispatcherProcess)
  is stored in the database and thus, how to query them.
  FamilyPRDispatcherProcess adds an important "family" name key to it's
  state which is used as a secondary key in the database and has no
  semantic/use in other implementations.
  """

  def SubscribeProcessList(self, request, context):
    """returns the ProcessList for the current query and then an updated
    ProcessList when the list changes.
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_DispatcherProcessManagerServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'SubscribeProcessList': grpc.unary_stream_rpc_method_handler(
          servicer.SubscribeProcessList,
          request_deserializer=messages__pb2.ProcessListQuery.FromString,
          response_serializer=messages__pb2.ProcessList.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.DispatcherProcessManager', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class AuthServiceStub(object):
  """/////
  Authorization/GitHub OAuth stuff
  /////

  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.InitSession = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/InitSession',
        request_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
        response_deserializer=messages__pb2.AuthStatus.FromString,
        )
    self.Logout = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/Logout',
        request_serializer=messages__pb2.SessionId.SerializeToString,
        response_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
        )
    self.Authorize = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/Authorize',
        request_serializer=messages__pb2.AuthorizeRequest.SerializeToString,
        response_deserializer=messages__pb2.AuthStatus.FromString,
        )
    self.CheckSession = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/CheckSession',
        request_serializer=messages__pb2.SessionId.SerializeToString,
        response_deserializer=messages__pb2.AuthStatus.FromString,
        )
    self.GetRoles = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/GetRoles',
        request_serializer=messages__pb2.AuthorizedRolesRequest.SerializeToString,
        response_deserializer=messages__pb2.AuthorizedRoles.FromString,
        )
    self.GetOAuthToken = channel.unary_unary(
        '/fontbakery.dashboard.AuthService/GetOAuthToken',
        request_serializer=messages__pb2.SessionId.SerializeToString,
        response_deserializer=messages__pb2.OAuthToken.FromString,
        )


class AuthServiceServicer(object):
  """/////
  Authorization/GitHub OAuth stuff
  /////

  """

  def InitSession(self, request, context):
    """**authentication**
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Logout(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def Authorize(self, request, context):
    """named like this due to the OAuth workflow
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def CheckSession(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def GetRoles(self, request, context):
    """
    **authorization** (could be another service)
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def GetOAuthToken(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_AuthServiceServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'InitSession': grpc.unary_unary_rpc_method_handler(
          servicer.InitSession,
          request_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
          response_serializer=messages__pb2.AuthStatus.SerializeToString,
      ),
      'Logout': grpc.unary_unary_rpc_method_handler(
          servicer.Logout,
          request_deserializer=messages__pb2.SessionId.FromString,
          response_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
      ),
      'Authorize': grpc.unary_unary_rpc_method_handler(
          servicer.Authorize,
          request_deserializer=messages__pb2.AuthorizeRequest.FromString,
          response_serializer=messages__pb2.AuthStatus.SerializeToString,
      ),
      'CheckSession': grpc.unary_unary_rpc_method_handler(
          servicer.CheckSession,
          request_deserializer=messages__pb2.SessionId.FromString,
          response_serializer=messages__pb2.AuthStatus.SerializeToString,
      ),
      'GetRoles': grpc.unary_unary_rpc_method_handler(
          servicer.GetRoles,
          request_deserializer=messages__pb2.AuthorizedRolesRequest.FromString,
          response_serializer=messages__pb2.AuthorizedRoles.SerializeToString,
      ),
      'GetOAuthToken': grpc.unary_unary_rpc_method_handler(
          servicer.GetOAuthToken,
          request_deserializer=messages__pb2.SessionId.FromString,
          response_serializer=messages__pb2.OAuthToken.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.AuthService', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))


class PullRequestDispatcherStub(object):
  """The Pull Request Dispatcher service

  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.Dispatch = channel.unary_unary(
        '/fontbakery.dashboard.PullRequestDispatcher/Dispatch',
        request_serializer=messages__pb2.PullRequest.SerializeToString,
        response_deserializer=google_dot_protobuf_dot_empty__pb2.Empty.FromString,
        )


class PullRequestDispatcherServicer(object):
  """The Pull Request Dispatcher service

  """

  def Dispatch(self, request, context):
    """If answering directly THIS COULD TIME OUT!
    instead, we answer with Empty and send the
    DispatchReport message via another channel,
    currently this is implement using an
    AMQP queue which feeds into ProcessManager.Execute
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_PullRequestDispatcherServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'Dispatch': grpc.unary_unary_rpc_method_handler(
          servicer.Dispatch,
          request_deserializer=messages__pb2.PullRequest.FromString,
          response_serializer=google_dot_protobuf_dot_empty__pb2.Empty.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'fontbakery.dashboard.PullRequestDispatcher', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))
