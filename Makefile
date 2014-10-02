EXAMPLES="bouncing-balls"

all: $(EXAMPLES)

$(EXAMPLES):
	@cd $@ && `npm bin`/browserify -d main.js | `npm bin`/exorcist bundle.js.map > bundle.js

clean:
	rm -rf */bundle.js

.PHONY: $(EXAMPLES) clean
