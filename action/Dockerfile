FROM node:10-slim

LABEL version="1.0.0"
LABEL repository="http://github.com/maticzav/semantha"
LABEL homepage="http://github.com/maticzav/semantha"
LABEL maintainer="Semantha <matic.zavadlal@gmail.com>"

LABEL com.github.actions.name="Semantha"
LABEL com.github.actions.description="Semantha Github Action."
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="red"

COPY "entrypoint.sh" "/entrypoint.sh"
ENTRYPOINT ["/entrypoint.sh"]
